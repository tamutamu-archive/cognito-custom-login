/* eslint no-console: ["error", { allow: ["error"] }] */

import 'jsdom-global/register'
import React from 'react'
import { mount } from 'enzyme'
import ForgotPasswordPage from './ForgotPasswordPage'
import ForgotPasswordForm from './ForgotPasswordForm'
import ResetPasswordForm from './ResetPasswordForm'
import * as Auth from '../utils/Auth'

describe('ForgotPasswordPage.js Tests', () => {
  const event = { preventDefault: () => {} }
  let wrapper
  beforeEach(() => {
    const div = document.createElement('div')
    div.setAttribute('id', 'specialchar')
    document.body.appendChild(div)
    wrapper = mount(<ForgotPasswordPage />)
  })

  it('should have reseting=false by default', () => {
    expect(wrapper.state().reseting).toEqual(false)
  })

  it('should contain <ForgotPasswordForm> by default', () => {
    expect(wrapper.find(ForgotPasswordForm).length).toEqual(1)
    expect(document.activeElement.id).toBe('email')
    expect(wrapper.find(ResetPasswordForm).length).toEqual(0)
  })

  it('should contain <ResetPasswordForm>', () => {
    const mock = jest.fn()

    console.error = mock

    expect(document.activeElement.id).toBe('email')

    wrapper.setState({ reseting: true, code: 'code', new_password: 'abc', confirm_password: 'def' })
    expect(document.activeElement.id).toBe('forgot_password_code')
    expect(wrapper.find(ForgotPasswordForm).length).toEqual(0)
    expect(wrapper.find(ResetPasswordForm).length).toEqual(1)
  })

  it('masks email correct', () => {
    const masked = wrapper.instance().mask('abcdef@domain.com')
    expect(masked).toEqual('a****f@domain.com')
  })

  it('sets code on updateCodeState', () => {
    wrapper.instance().updateCodeState({ target: { value: 'the_code' } })
    expect(wrapper.state().code).toEqual('the_code')
  })

  it('sets email on updatEmailState', () => {
    wrapper.instance().updateEmailState({ target: { value: 'email' } })
    expect(wrapper.state().email).toEqual('email')
  })

  it('sets new password on updateNewPasswordState', () => {
    wrapper.instance().updateNewPasswordState({ target: { value: 'password' } })
    expect(wrapper.state().new_password).toEqual('password')
  })

  it('sets conform password on updateConfirmPasswordState', () => {
    wrapper.instance().updateConfirmPasswordState({ target: { value: 'password' } })
    expect(wrapper.state().confirm_password).toEqual('password')
  })

  it('sets up correctly when showing reset area', () => {
    const mock = jest.fn()

    // eslint-disable-next-line no-console
    console.error = mock

    wrapper.setState({reseting: false, maskedEmail: ''})
    wrapper.instance().setState({email: 'abcdef@domain.com'})
    wrapper.instance().showResetArea()
    expect(wrapper.state().reseting).toEqual(true)
    expect(wrapper.state().email).toEqual('a****f@domain.com')
  })

  it('shows error correctly', () => {
    wrapper.instance().showError('some_message')
    expect(wrapper.state().errorMsg).toEqual('some_message')
  })

  it('#showError() calls focus', () => {
    const focus = jest.spyOn(wrapper.instance().inputRef.current, 'focus')
    expect(focus).toBeCalledTimes(0)
    wrapper.instance().showError('some_message')
    expect(focus).toBeCalledTimes(1)
  })

  describe('onEmailSubmit Tests', () => {
    const mockForgotPassword = jest.fn()
    let cognitoUser = {
      forgotPassword: mockForgotPassword
    }

    const mockAuthCreateUser = jest.fn()

    beforeEach(() => {
      // eslint-disable-next-line
            Auth.createUser = mockAuthCreateUser;
      cognitoUser = {
        forgotPassword: mockForgotPassword
      }
      mockAuthCreateUser.mockReturnValue(cognitoUser)
    })

    afterEach(() => {
      mockForgotPassword.mockReset()
      mockAuthCreateUser.mockReset()
    })

    it('sets cognitoUser to state', () => {
      wrapper.instance().onEmailSubmit(event)
      expect(wrapper.state().cognitoUser).toEqual(cognitoUser)
    })

    it('calls forgotPassword', () => {
      wrapper.instance().onEmailSubmit(event)
      expect(mockForgotPassword.mock.calls.length).toEqual(1)
    })

    it('displays email is required if InvalidParameter', () => {
      const mockShowError = jest.fn()

      cognitoUser.forgotPassword = (callback) => {
        callback.onFailure({code: 'InvalidParameterException', message: 'some_message'})
      }
      const instance = wrapper.instance()
      instance.showError = mockShowError
      instance.onEmailSubmit(event)

      expect(mockShowError.mock.calls.length).toEqual(1)
      expect(mockShowError.mock.calls[0][0]).toEqual('Email is required')
    })

    it('displays given errorMessage if not InvalidParameter', () => {
      const mockShowError = jest.fn()

      cognitoUser.forgotPassword = (callback) => {
        callback.onFailure({code: 'something', message: 'some_message'})
      }
      const instance = wrapper.instance()
      instance.showError = mockShowError
      instance.onEmailSubmit(event)

      expect(mockShowError.mock.calls.length).toEqual(1)
      expect(mockShowError.mock.calls[0][0]).toEqual('some_message')
    })

    it('shows reset area', () => {
      const mockShowResetArea = jest.fn()

      cognitoUser.forgotPassword = (callback) => {
        callback.inputVerificationCode()
      }
      const instance = wrapper.instance()
      instance.showResetArea = mockShowResetArea

      instance.onEmailSubmit(event)

      expect(mockShowResetArea.mock.calls.length).toEqual(1)
    })
  })

  describe('changePassword Tests', () => {
    const mockConfirmPassword = jest.fn()
    let cognitoUser = {
      confirmPassword: mockConfirmPassword
    }

    const mockAuthCreateUser = jest.fn()

    beforeEach(() => {
      // eslint-disable-next-line
            Auth.createUser = mockAuthCreateUser;
      cognitoUser = {
        confirmPassword: mockConfirmPassword
      }
      mockAuthCreateUser.mockReturnValue(cognitoUser)
    })

    afterEach(() => {
      mockConfirmPassword.mockReset()
      mockAuthCreateUser.mockReset()
    })

    it('shows error when passwords do not match', () => {
      const mockShowError = jest.fn()

      const instance = wrapper.instance()
      instance.showError = mockShowError
      instance.setState({new_password: 'foobar', confirm_password: 'bazbar'})
      instance.changePassword(event)

      expect(mockShowError.mock.calls.length).toEqual(1)
      expect(mockShowError.mock.calls[0][0]).toEqual('Passwords do not match')
    })

    it('calls confirm password when passwords match', () => {
      const instance = wrapper.instance()
      instance.setState({new_password: 'foobar', confirm_password: 'foobar', code: 'some_code', cognitoUser: cognitoUser})
      instance.changePassword(event)

      expect(mockConfirmPassword.mock.calls.length).toEqual(1)
      expect(mockConfirmPassword.mock.calls[0][0]).toEqual('some_code')
      expect(mockConfirmPassword.mock.calls[0][1]).toEqual('foobar')
    })

    it('shows error on confirm password error', () => {
      const mockShowError = jest.fn()

      const instance = wrapper.instance()
      instance.showError = mockShowError
      cognitoUser.confirmPassword = (code, password, callback) => {
        callback.onFailure({message: 'some_message'})
      }

      instance.setState({new_password: 'foobar', confirm_password: 'foobar', cognitoUser: cognitoUser, code: '  some_code'})
      instance.changePassword(event)

      expect(mockShowError.mock.calls.length).toEqual(1)
      expect(mockShowError.mock.calls[0][0]).toEqual('some_message')
    })

    it('Shows custom error message, when error code is InvalidParameterException', () => {
      const mockShowError = jest.fn()

      const instance = wrapper.instance()
      instance.showError = mockShowError
      const err = {code: 'InvalidParameterException'}
      cognitoUser.confirmPassword = (code, password, callback) => {
        callback.onFailure(err)
      }

      instance.setState({new_password: 'foo', confirm_password: 'foo', cognitoUser: cognitoUser, code: 'some_code  '})
      instance.changePassword(event)

      expect(mockShowError.mock.calls.length).toEqual(1)
      expect(mockShowError.mock.calls[0][0]).toEqual('Password does not conform to policy: Password not long enough')
    })

    it('pushes to login and show success message on success', () => {
      const mockPush = jest.fn()

      const instance = wrapper.instance()
      const history = {push: mockPush}
      wrapper.setProps({history: history})
      cognitoUser.confirmPassword = (code, password, callback) => {
        callback.onSuccess()
      }

      instance.setState({new_password: 'foobar', confirm_password: 'foobar', cognitoUser: cognitoUser, code: ' some_code  '})
      instance.changePassword(event)

      expect(mockPush.mock.calls.length).toEqual(2)
      expect(mockPush.mock.calls[0][0]).toEqual('/login')
      expect(mockPush.mock.calls[1][0]).toEqual({msg: 'Password has been reset successfully. Please use your new password to login.'})
    })
  })

  describe('Focus changes', () => {
    it(' present resetting is false and previous resetting was true', () => {
      wrapper.setState({ reseting: true })
      expect(document.activeElement.id).toEqual('forgot_password_code')
      wrapper.setState({ reseting: false })
      expect(document.activeElement.id).toEqual('email')
    })

    it(' present resetting is true and previous resetting was false', () => {
      wrapper.setState({ reseting: false })
      expect(document.activeElement.id).toEqual('email')
      wrapper.setState({ reseting: true })
      expect(document.activeElement.id).toEqual('forgot_password_code')
    })

    it('componentDidMount', () => {
      const focus = jest.spyOn(wrapper.instance().inputRef.current, 'focus')
      expect(focus).toBeCalledTimes(0)
      wrapper.instance().componentDidMount()
      expect(focus).toBeCalledTimes(1)
    })
    it('componentDidUpdate', () => {
      const prevState = {
        reseting: true
      }
      const prevProps = { history: { location: { msg: '' } } }
      const focus = jest.spyOn(wrapper.instance().inputRef.current, 'focus')
      expect(focus).toBeCalledTimes(0)
      wrapper.instance().componentDidUpdate(prevProps, prevState)
      expect(focus).toBeCalledTimes(1)
    })
  })
})
