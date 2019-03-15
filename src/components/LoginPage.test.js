/* eslint "no-magic-numbers": [0, { "enforceConst": true, "ignore": [-1,0,1,2] }] */

import 'jsdom-global/register'
import React from 'react'
import { mount } from 'enzyme'
import LoginPage from './LoginPage'
import LoginForm from './LoginForm'
import MfaForm from './MfaForm'
import NewPasswordRequiredForm from './NewPasswordRequiredForm'
import * as Auth from '../utils/Auth'
import CodeExpired from './CodeExpired'
import { MODE, mfaMessages, updatePasswordMessages, mfaTotalAttempts } from '../utils/constants'

describe('LoginPage.js Tests', () => {
  jest.useFakeTimers()
  let wrapper
  beforeEach(() => {
    wrapper = mount(<LoginPage />)
  })
  it('should have mode of login by default', () => {
    expect(wrapper.state().mode).toEqual(MODE.LOGIN)
  })

  it('should contain <LoginForm> by default', () => {
    expect(wrapper.find(LoginForm).length).toEqual(1)
    expect(document.activeElement.id).toEqual('email')
    expect(wrapper.find(MfaForm).length).toEqual(0)
  })

  it('replace login page with MFA page when the mode is VALIDATING', () => {
    wrapper.setState({ mode: MODE.VALIDATING })
    expect(wrapper.find(LoginForm).length).toEqual(0)
    expect(wrapper.find(MfaForm).length).toEqual(1)
    expect(document.activeElement.id).toEqual('code')
  })

  it('replace login page with code expired page when the mode is CODE_EXPIRED', () => {
    wrapper.setState({ mode: MODE.CODE_EXPIRED })
    expect(wrapper.find(LoginForm).length).toEqual(0)
    expect(wrapper.find(CodeExpired).length).toEqual(1)
  })

  it('replace login page with New password required form page when the mode is NEW_PASSWORD', () => {
    wrapper.setState({ mode: MODE.NEW_PASSWORD })
    expect(wrapper.find(LoginForm).length).toEqual(0)
    expect(wrapper.find(MfaForm).length).toEqual(0)
    expect(wrapper.find(NewPasswordRequiredForm).length).toEqual(1)
    expect(document.activeElement.id).toEqual('newPassword')
  })

  it('should contain form', () => {
    expect(wrapper.find('#login-form').length).toEqual(1)
  })

  it('sets code on input change', () => {
    wrapper.instance().onInputChange({ target: { id: 'code', value: 'the_code' } })
    expect(wrapper.state().code).toEqual('the_code')
  })

  it('sets email on input change', () => {
    wrapper.instance().onInputChange({ target: { id: 'email', value: 'email' } })
    expect(wrapper.state().email).toEqual('email')
  })

  it('sets password on input change', () => {
    wrapper.instance().onInputChange({ target: { id: 'password', value: 'password' } })
    expect(wrapper.state().password).toEqual('password')
  })

  it('sets newPassword on input change and validates newPassword', () => {
    wrapper.instance().onInputChange({ target: { id: 'newPassword', value: 'password' } })
    expect(wrapper.state().newPassword).toEqual('password')
    expect(wrapper.state().maxLength).toEqual(true)
  })

  it('sets confirmPassoword on input change', () => {
    wrapper.instance().onInputChange({ target: { id: 'confirmPassword', value: 'password' } })
    expect(wrapper.state().confirmPassword).toEqual('password')
    expect(wrapper.state().maxLength).toEqual(false)
  })

  it('sets up correctly when showing validation area', () => {
    const countDown = 122
    wrapper.setState({ mode: MODE.LOGIN, maskedEmail: '', countDown: countDown, MfaAttemptsRemaining: 1 })
    wrapper.instance().showValidationArea('a@test.com')
    expect(wrapper.state().mode).toEqual(MODE.VALIDATING)
    expect(wrapper.state().maskedEmail).toEqual('a@test.com')
    expect(wrapper.state().errorMsg).toEqual('')
    expect(wrapper.state().countDown).toEqual(178)
    expect(wrapper.state().MfaAttemptsRemaining).toEqual(3)
    const mockStartTimer = wrapper.instance().startTimer
    expect(setInterval).toHaveBeenLastCalledWith(mockStartTimer, 1000)
  })

  it('sets up correctly after startTimer is called, when countDown is greater than 0', () => {
    const countDown = 124
    wrapper.setState({ mode: MODE.VALIDATING, maskedEmail: 'a@test.com', countDown: countDown, code: 'LETMEIN' })
    wrapper.instance().startTimer()
    expect(wrapper.state().mode).toEqual(MODE.VALIDATING)
    expect(wrapper.state().maskedEmail).toEqual('a@test.com')
    expect(wrapper.state().countDown).toEqual(123)
  })

  it('sets up correctly after startTimer is called & Code Timeout, when countDown comes to 1 second', () => {
    const countDown = 1
    wrapper.setState({ mode: MODE.VALIDATING, maskedEmail: 'a@test.com', countDown: countDown })
    wrapper.instance().startTimer()
    expect(wrapper.state().mode).toEqual(MODE.CODE_EXPIRED)
    expect(wrapper.state().maskedEmail).toEqual('a@test.com')
    expect(wrapper.state().userMsg1).toEqual('Please return to the login screen and re-enter your login information.')
    expect(wrapper.state().userMsg2).toEqual('A new code will be sent to your email.')
  })

  it('sets up correctly after startTimer is called & session Timeout, when countDown = 0', () => {
    const countDown = 0
    wrapper.setState({ mode: MODE.NEW_PASSWORD, maskedEmail: 'a@test.com', countDown: countDown, email: 'a@test.com', password: 'something' })
    wrapper.instance().startTimer()
    expect(wrapper.state().mode).toEqual(MODE.CODE_EXPIRED)
    expect(wrapper.state().code).toEqual('')
    expect(wrapper.state().email).toEqual('a@test.com')
    expect(wrapper.state().password).toEqual('')
    expect(wrapper.state().maskedEmail).toEqual('a@test.com')
    expect(wrapper.state().userMsg1).toEqual('Please return to the login screen to re-start')
    expect(wrapper.state().userMsg2).toEqual('Password Update process.')
  })
  it('#showError() is called with code expired messages', () => {
    wrapper.instance().showError(mfaMessages.errorMsg, MODE.CODE_EXPIRED, mfaTotalAttempts, mfaMessages)
    expect(wrapper.state().mode).toEqual(MODE.CODE_EXPIRED)
    expect(wrapper.state().errorMsg).toEqual(mfaMessages.errorMsg)
    expect(wrapper.state().userMsg1).toEqual(mfaMessages.userMsg1)
    expect(wrapper.state().userMsg2).toEqual(mfaMessages.userMsg2)
  })

  it('#showError() is called with session expired messages', () => {
    wrapper.instance().setState({ mode: MODE.NEW_PASSWORD })
    wrapper.instance().showError(updatePasswordMessages.errorMsg, MODE.CODE_EXPIRED, mfaTotalAttempts, updatePasswordMessages)
    expect(wrapper.state().mode).toEqual(MODE.CODE_EXPIRED)
    expect(wrapper.state().errorMsg).toEqual(updatePasswordMessages.errorMsg)
    expect(wrapper.state().userMsg1).toEqual(updatePasswordMessages.userMsg1)
    expect(wrapper.state().userMsg2).toEqual(updatePasswordMessages.userMsg2)
  })

  it('#showError() calls focus', () => {
    const focus = jest.spyOn(wrapper.instance().inputRef.current, 'focus')
    expect(focus).toBeCalledTimes(0)
    wrapper.instance().showError('some_message')
    expect(focus).toBeCalledTimes(1)
  })

  it('sets up correctly when unknown mode', () => {
    const mockShowError = jest.fn()

    wrapper.instance().showError = mockShowError
    wrapper.setState({ mode: -1 })

    expect(mockShowError.mock.calls.length).toEqual(1)
    expect(mockShowError.mock.calls[0][0]).toEqual('Unknown Request')
  })

  it('sets up correctly when showError', () => {
    const countDown = 178
    wrapper.setState({
      mode: MODE.VALIDATING,
      maskedEmail: 'somevalue',
      errorMsg: '',
      email: 'a@a.com',
      password: 'password'
    })
    const cardMessages = {
      userMsg1: '',
      userMsg2: ''
    }
    wrapper.instance().showError('msg', MODE.LOGIN, mfaTotalAttempts, cardMessages, 'somePassword')
    expect(wrapper.state()).toEqual({
      MfaAttemptsRemaining: mfaTotalAttempts,
      code: '',
      mode: MODE.LOGIN,
      maskedEmail: 'somevalue',
      errorMsg: 'msg',
      email: 'a@a.com',
      password: 'somePassword',
      cognitoJson: '{}',
      newPassword: '',
      confirmPassword: '',
      countDown,
      disableSignIn: false,
      disableVerify: false,
      maxLength: false,
      lowerCase: false,
      upperCase: false,
      number: false,
      specialCharacter: false,
      userMsg1: '',
      userMsg2: ''
    })
  })

  it('sets up correctly when showing update password page', () => {
    wrapper.setState({ mode: MODE.LOGIN, errorMsg: 'some-text' })
    wrapper.instance().showNewPasswordRequiredArea()
    expect(wrapper.state().mode).toEqual(MODE.NEW_PASSWORD)
    expect(wrapper.state().errorMsg).toEqual('')
  })

  it('MfaAttemptsRemaining should have 3 as initial value', () => {
    expect(wrapper.state().MfaAttemptsRemaining).toEqual(mfaTotalAttempts)
  })

  describe('validate Tests', () => {
    const event = { preventDefault: () => { } }
    it('calls cognitoUser.sendCustomChallengeAnswer with correct value', () => {
      const sendCustomChallengeAnswer = jest.fn()
      const cognitoUser = {
        deviceKey: 'device_key',
        sendCustomChallengeAnswer: sendCustomChallengeAnswer
      }

      wrapper.setState(
        {
          cognitoUser: cognitoUser,
          code: 'some_code'
        }
      )
      wrapper.instance().validate(event)
      expect(sendCustomChallengeAnswer.mock.calls.length).toEqual(1)
      expect(sendCustomChallengeAnswer.mock.calls[0][0]).toEqual('some_code device_key')
    })

    it('calls showError when error', () => {
      const mockShowError = jest.fn()

      const sendCustomChallengeAnswer = (response, callback) => {
        callback.onFailure()
      }
      const cognitoUser = {
        deviceKey: 'device_key',
        sendCustomChallengeAnswer: sendCustomChallengeAnswer
      }
      wrapper.setState(
        {
          cognitoUser: cognitoUser,
          code: 'some_code',
          MfaAttemptsRemaining: 2
        }
      )
      expect(wrapper.state().MfaAttemptsRemaining).toEqual(2)
      wrapper.instance().showError = mockShowError
      wrapper.instance().validate(event)
      expect(mockShowError.mock.calls.length).toEqual(1)
      return mockShowError.mock.calls[0][0].then(msg => {
        expect(msg).toEqual(<span>Error. Incorrect code. You have <b>1</b> attempt remaining.</span>)
      })
    })

    describe('verify button', () => {
      it('verify button default state', () => {
        wrapper.setState({ mode: MODE.VALIDATING, code: '' })
        expect(wrapper.find(MfaForm).props().disableVerify).toEqual(false)
      })

      it('changes verify button state', () => {
        const sendCustomChallengeAnswer = jest.fn()
        wrapper.setState({ mode: MODE.VALIDATING, code: '' })
        expect(wrapper.find(MfaForm).props().disableVerify).toEqual(false)
        const cognitoUser = {
          deviceKey: 'device_key',
          sendCustomChallengeAnswer: sendCustomChallengeAnswer
        }
        wrapper.setState(
          {
            cognitoUser: cognitoUser,
            code: 'some_code'
          }
        )
        wrapper.instance().validate(event)
        wrapper.setState({ disableVerify: true })
        expect(wrapper.find(MfaForm).props().disableVerify).toEqual(true)
      })
    })
  })

  describe('login Tests', () => {
    const mockAuthenticateUserDefaultAuth = jest.fn()
    const mockSendCustomChallengeAnswer = jest.fn()
    const mockSetAuthenticationFlowType = jest.fn()
    const mockPush = jest.fn()
    const event = { preventDefault: () => { } }
    let cognitoUser = {
      authenticateUserDefaultAuth: mockAuthenticateUserDefaultAuth,
      sendCustomChallengeAnswer: mockSendCustomChallengeAnswer,
      setAuthenticationFlowType: mockSetAuthenticationFlowType,
      deviceKey: 'device_key'
    }

    const mockAuthCreateUser = jest.fn()

    Auth.createUser = mockAuthCreateUser
    let history

    beforeEach(() => {
      cognitoUser = {
        authenticateUserDefaultAuth: mockAuthenticateUserDefaultAuth,
        sendCustomChallengeAnswer: mockSendCustomChallengeAnswer,
        setAuthenticationFlowType: mockSetAuthenticationFlowType,
        deviceKey: 'device_key'
      }
      mockAuthCreateUser.mockReturnValue(cognitoUser)
      history = { push: mockPush, location: { msg: '' } }
    })

    afterEach(() => {
      mockAuthenticateUserDefaultAuth.mockReset()
      mockSendCustomChallengeAnswer.mockReset()
      mockSetAuthenticationFlowType.mockReset()
      mockAuthCreateUser.mockReset()
    })

    it('sets cognitoUser to state', () => {
      wrapper = mount(<LoginPage history={history} />)

      wrapper.instance().login(event)
      expect(wrapper.state().cognitoUser).toEqual(cognitoUser)
    })

    it('calls clearInterval when login', () => {
      wrapper = mount(<LoginPage history={history} />)
      wrapper.instance().timer = 75
      wrapper.instance().login(event)
      const timer = wrapper.instance().timer
      expect(clearInterval).toHaveBeenLastCalledWith(timer)
    })

    it('sets authenticationFlowType to CUSTOM_AUTH', () => {
      wrapper = mount(<LoginPage history={history} />)
      wrapper.instance().login(event)

      expect(mockSetAuthenticationFlowType.mock.calls.length).toEqual(1)
      expect(mockSetAuthenticationFlowType.mock.calls[0][0]).toEqual('CUSTOM_AUTH')
    })

    it('calls cognitoUser.authenticateUserDefaultAuth', () => {
      wrapper = mount(<LoginPage history={history} />)
      wrapper.instance().login(event)

      expect(mockAuthenticateUserDefaultAuth.mock.calls.length).toEqual(1)
    })

    it('displays custom message(Too many failed login attempts.) when locked out message', async () => {
      const mockShowError = jest.fn()

      wrapper = mount(<LoginPage history={history} />)
      cognitoUser.authenticateUserDefaultAuth = (details, callback) => {
        callback.onFailure({ code: 'ABC', message: 'PreAuthentication failed with error Account Locked Out.' })
      }
      const instance = wrapper.instance()
      instance.showError = mockShowError
      await instance.login(event)

      expect(mockShowError.mock.calls.length).toEqual(1)
      expect(mockShowError.mock.calls[0][0]).toEqual(<span>Too many failed login attempts. Please reset your password or contact your CWS-CARES administrator for assistance.</span>)
    })

    it('displays custom message(email is required) when both email/password are empty', async () => {
      const mockShowError = jest.fn()

      wrapper = mount(<LoginPage history={history} />)
      cognitoUser.authenticateUserDefaultAuth = (details, callback) => {
        callback.onFailure({ code: 'InvalidParameterException', message: 'Missing required parameter USERNAME' })
      }
      const instance = wrapper.instance()
      instance.showError = mockShowError
      await instance.login(event)

      expect(mockShowError.mock.calls.length).toEqual(1)
      expect(mockShowError.mock.calls[0][0]).toEqual('Email is required.')
      expect(document.activeElement.id).toEqual('email')
    })

    it('displays custom error message when user is expired', async () => {
      const mockShowError = jest.fn()

      wrapper = mount(<LoginPage history={history} />)
      cognitoUser.authenticateUserDefaultAuth = (details, callback) => {
        callback.onFailure({ code: 'NotAuthorizedException', message: 'User account has expired, it must be reset by an administrator.' })
      }
      const instance = wrapper.instance()
      instance.showError = mockShowError
      await instance.login(event)

      expect(mockShowError.mock.calls.length).toEqual(1)
      expect(mockShowError.mock.calls[0][0]).toEqual('Your temporary password has expired and must be reset by an administrator.')
      expect(document.activeElement.id).toEqual('email')
    })

    it('displays default error message', async () => {
      const mockShowError = jest.fn()

      wrapper = mount(<LoginPage history={history} />)
      cognitoUser.authenticateUserDefaultAuth = (details, callback) => {
        callback.onFailure({ code: 'something', message: 'some_message' })
      }
      const instance = wrapper.instance()
      instance.showError = mockShowError
      await instance.login(event)

      expect(mockShowError.mock.calls.length).toEqual(1)
      expect(mockShowError.mock.calls[0][0]).toEqual('some_message')
    })

    it('changes errorMsg state to empty string after successful signIn', async () => {
      const mockShowError = jest.fn()

      wrapper = mount(<LoginPage history={history} />)
      cognitoUser.authenticateUserDefaultAuth = (details, callback) => {
        callback.onFailure({ code: 'something', message: 'some_message' })
      }
      const instance = wrapper.instance()
      instance.showError = mockShowError
      await instance.login(event)

      expect(mockShowError.mock.calls.length).toEqual(1)
      expect(mockShowError.mock.calls[0][0]).toEqual('some_message')

      wrapper.instance().showValidationArea('a@test.com')
      expect(wrapper.state().mode).toEqual(MODE.VALIDATING)
      expect(document.activeElement.id).toEqual('code')
      expect(wrapper.state().maskedEmail).toEqual('a@test.com')
      expect(wrapper.state().errorMsg).toEqual('')
    })

    describe('customChallenge Tests', () => {
      it('calls showError on Error', () => {
        const mockShowError = jest.fn()

        wrapper = mount(<LoginPage history={history} />)
        cognitoUser.authenticateUserDefaultAuth = (details, callback) => {
          callback.customChallenge()
        }
        cognitoUser.sendCustomChallengeAnswer = (details, callback) => {
          callback.onFailure({ code: 'somecode', message: 'some_message' })
        }
        const instance = wrapper.instance()
        instance.showError = mockShowError
        instance.login(event)

        expect(mockShowError.mock.calls.length).toEqual(1)
        expect(mockShowError.mock.calls[0][0]).toEqual('some_message')
      })

      it('calls setCognitoToken when success', () => {
        const mockSetCognitoToken = jest.fn()

        const sendCustomChallengeAnswer = (response, callback) => {
          callback.onSuccess()
        }
        const cognitoUser = {
          deviceKey: 'device_key',
          sendCustomChallengeAnswer: sendCustomChallengeAnswer
        }
        wrapper = mount(<LoginPage history={history} />)
        wrapper.setState(
          {
            cognitoUser: cognitoUser,
            code: 'some_code'
          }
        )

        const instance = wrapper.instance()
        instance.setCognitoToken = mockSetCognitoToken
        instance.validate(event)
        expect(mockSetCognitoToken.mock.calls.length).toEqual(1)
      })

      it('calls sendToRedirectUri', () => {
        const mockSetCognitoToken = jest.fn()
        wrapper = mount(<LoginPage history={history} />)
        cognitoUser.authenticateUserDefaultAuth = (details, callback) => {
          callback.customChallenge()
        }
        cognitoUser.sendCustomChallengeAnswer = (details, callback) => {
          callback.onSuccess()
        }

        const instance = wrapper.instance()
        instance.setCognitoToken = mockSetCognitoToken
        instance.login(event)
        expect(mockSetCognitoToken.mock.calls.length).toEqual(1)
      })

      it('shows validation area', () => {
        const mockShowValidationArea = jest.fn()
        wrapper = mount(<LoginPage history={history} />)
        cognitoUser.authenticateUserDefaultAuth = (details, callback) => {
          callback.customChallenge()
        }
        cognitoUser.sendCustomChallengeAnswer = (details, callback) => {
          callback.customChallenge({ maskedEmail: 'someEmail' })
        }

        const instance = wrapper.instance()
        instance.showValidationArea = mockShowValidationArea
        instance.login(event)

        expect(mockShowValidationArea.mock.calls.length).toEqual(1)
        expect(mockShowValidationArea.mock.calls[0][0]).toEqual('someEmail')
      })
    })

    describe('login button', () => {
      it('login button default state', () => {
        wrapper = mount(<LoginPage history={history} />)
        expect(wrapper.find(LoginForm).props().disableSignIn).toEqual(false)
      })

      it('changes login in button state', () => {
        const mockSetCognitoToken = jest.fn()
        const wrapper = mount(<LoginPage history={history} />)
        expect(wrapper.find(LoginForm).props().disableSignIn).toEqual(false)
        wrapper.instance().login(event)
        wrapper.setState({ disableSignIn: true })
        expect(wrapper.find(LoginForm).props().disableSignIn).toEqual(true)
      })
    })
  })

  describe('changePassword tests', () => {
    const event = { preventDefault: () => { } }
    it('shows error when passwords do not match', () => {
      const mockShowError = jest.fn()
      wrapper.setState({
        mode: MODE.NEW_PASSWORD,
        confirmPassword: 'foo',
        newPassword: 'bar'
      })

      const instance = wrapper.instance()
      instance.showError = mockShowError
      instance.changePassword(event)

      expect(wrapper.state().newPassword).toEqual('')
      expect(wrapper.state().confirmPassword).toEqual('')
      expect(mockShowError.mock.calls.length).toEqual(1)
      expect(mockShowError.mock.calls[0][0]).toEqual('Passwords do not match')
      expect(mockShowError.mock.calls[0][1]).toEqual(3)
    })

    describe('completeNewPasswordChallenge', () => {
      const mockAuthenticateUserDefaultAuth = jest.fn()
      const mockSendCustomChallengeAnswer = jest.fn()
      const mockSetAuthenticationFlowType = jest.fn()
      const cognitoUser = {
        authenticateUserDefaultAuth: mockAuthenticateUserDefaultAuth,
        sendCustomChallengeAnswer: mockSendCustomChallengeAnswer,
        setAuthenticationFlowType: mockSetAuthenticationFlowType,
        deviceKey: 'device_key'
      }

      it('handles failure', () => {
        const mockShowError = jest.fn()
        cognitoUser.completeNewPasswordChallenge = (newPassword, details, callback) => {
          callback.onFailure({ message: 'some message' })
        }

        wrapper.setState(
          {
            cognitoUser: cognitoUser
          }
        )

        const instance = wrapper.instance()
        instance.showError = mockShowError
        instance.changePassword(event)

        expect(mockShowError.mock.calls.length).toEqual(1)
        expect(mockShowError.mock.calls[0][0]).toEqual('some message')
        expect(mockShowError.mock.calls[0][1]).toEqual(3)
      })

      it('handles success', () => {
        const result = { foo: 'bar' }
        const mockSetCognitoToken = jest.fn()
        cognitoUser.completeNewPasswordChallenge = (newPassword, details, callback) => {
          callback.onSuccess(result)
        }

        wrapper.setState(
          {
            cognitoUser: cognitoUser
          }
        )

        const instance = wrapper.instance()
        instance.setCognitoToken = mockSetCognitoToken
        instance.changePassword(event)

        expect(mockSetCognitoToken.mock.calls.length).toEqual(1)
        expect(mockSetCognitoToken.mock.calls[0][0]).toEqual(JSON.stringify(result))
      })
    })
  })

  describe('Cancel button', () => {
    const newPasswordValue = '123'
    const confirmPasswordValue = '456'

    it('calls onCancel', () => {
      wrapper.setState({
        mode: MODE.VALIDATING,
        disableSignIn: true,
        errorMsg: 'Some-error',
        newPassword: newPasswordValue,
        confirmPassword: confirmPasswordValue
      })

      expect(wrapper.state().mode).toEqual(MODE.VALIDATING)
      expect(document.activeElement.id).toEqual('code')
      expect(wrapper.find(MfaForm).length).toEqual(1)
      expect(wrapper.state().errorMsg).toEqual('Some-error')
      expect(wrapper.state().newPassword).toEqual(newPasswordValue)
      expect(wrapper.state().confirmPassword).toEqual(confirmPasswordValue)

      wrapper.instance().onCancel()

      wrapper.update()
      expect(wrapper.state().mode).toEqual(MODE.LOGIN)
      expect(document.activeElement.id).toEqual('email')
      expect(wrapper.state().disableSignIn).toEqual(false)
      expect(wrapper.state().errorMsg).toEqual('')
      expect(wrapper.state().MfaAttemptsRemaining).toEqual(mfaTotalAttempts)
      expect(wrapper.state().countDown).toEqual(178)
      expect(wrapper.state().newPassword).toEqual('')
      expect(wrapper.state().confirmPassword).toEqual('')
      expect(wrapper.find(LoginForm).length).toEqual(1)
    })
  })

  describe('Focus changes', () => {
    it(' present mode is not equal to previous mode', () => {
      wrapper.setState({ mode: MODE.LOGIN })
      expect(document.activeElement.id).toEqual('email')
      wrapper.setState({ mode: MODE.VALIDATING })
      expect(document.activeElement.id).toEqual('code')
    })

    it(' present mode is one of the valid modes', () => {
      wrapper.setState({ mode: MODE.NEW_PASSWORD })
      expect(document.activeElement.id).toEqual('newPassword')
    })

    it(' present mode is not equal to CODE_EXPIRED mode', () => {
      wrapper.setState({ mode: MODE.CODE_EXPIRED })
      expect(document.activeElement.id).toEqual('')
    })

    it('componentDidMount', () => {
      const focus = jest.spyOn(wrapper.instance().inputRef.current, 'focus')
      expect(focus).toBeCalledTimes(0)
      wrapper.instance().componentDidMount()
      expect(focus).toBeCalledTimes(1)
    })

    it('componentDidUpdate', () => {
      const prevState = {
        mode: MODE.VALIDATING
      }
      const prevProps = { history: { location: { msg: '' } } }
      const focus = jest.spyOn(wrapper.instance().inputRef.current, 'focus')
      expect(focus).toBeCalledTimes(0)
      expect(wrapper.state().mode).toBe(MODE.LOGIN)
      wrapper.instance().componentDidUpdate(prevProps, prevState)
      expect(focus).toBeCalledTimes(1)
    })
  })
})
