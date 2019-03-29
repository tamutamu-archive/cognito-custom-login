/* eslint "no-magic-numbers": [0, { "enforceConst": true, "ignore": [-1,0,1,2] }] */

import React from 'react'
import { shallow } from 'enzyme'
import MfaForm from './MfaForm'
import UserMessage from './UserMessage'

describe('MfaForm.js Tests', () => {
  const countDown = 128
  const mock = jest.fn()
  const wrapper = shallow(
    <MfaForm
      maskedEmail="a@test.com"
      code="the_code"
      onCodeChange={mock}
      onValidate={mock}
      onCancel={mock}
      errorMsg="some_message"
      onResend={mock}
      countDown={countDown}
    />
  )
  it('should require correct params', () => {
    // eslint-disable-next-line no-console
    console.error = mock

    shallow(<MfaForm countDown={countDown}/>)

    expect(mock).toHaveBeenCalledTimes(3)
    const concat = [].concat(...mock.mock.calls)
    expect(concat.some((element) => { return element.includes('`onCodeChange` is marked as required') })).toBe(true)
    expect(concat.some((element) => { return element.includes('`onValidate` is marked as required') })).toBe(true)
    expect(concat.some((element) => { return element.includes('`onChange` is marked as required') })).toBe(true)
  })

  it('should display `Account Verification` at top', () => {
    const h1 = wrapper.find('h1')

    expect(h1).toHaveLength(1)
    expect(h1.text()).toEqual('Account Verification Required')
  })

  describe('instructions Tests', () => {
    it('should display instructions', () => {
      const span = wrapper.find('p')

      expect(span).toHaveLength(3)
      expect(span.at(0).text()).toEqual('For additional security, we need to verify your account on this device.')
      expect(span.at(1).text()).toEqual('An email was sent to a@test.com with a unique verification code. Please enter that code below.')
      expect(span.at(2).text()).toEqual('Expires in: 2:08')
      expect(wrapper.find('span').at(0).text()).toEqual('Not Working?<Button />')
    })
  })

  describe('code input Tests', () => {
    const input = wrapper.find('PasswordInput')
    it('contains label', () => {
      const label = wrapper.find('label')
      expect(label).toHaveLength(1)
      expect(label.text()).toEqual('Verification Code')
    })

    it('contains text input for code', () => {
      expect(input).toHaveLength(1)
      expect(input.props().id).toEqual('code')
    })

    it('lets component manage code value', () => {
      expect(input).toHaveLength(1)
      expect(input.props().password).toEqual('the_code')
    })

    it('should pass errorMsg to <UserMessage>', () => {
      const UserMessageTag = wrapper.find(UserMessage)
      expect(UserMessageTag).toHaveLength(1)
      expect(UserMessageTag.props().errorMessage).toEqual('some_message')
    })

    it('has type of PasswordInput', () => {
      expect(input).toHaveLength(1)
    })

    it('calls correct callback onChange', () => {
      expect(input).toHaveLength(1)
      expect(input.props().onChange).toEqual(mock)
    })
  })

  describe('Resend button Tests', () => {
    const button = wrapper.find('.resend-button')
    it('contains resend button', () => {
      expect(button).toHaveLength(1)
    })

    it('has correct text on resend button', () => {
      expect(button.props().children).toEqual('Resend')
    })

    it('calls correct callback onClick', () => {
      expect(button).toHaveLength(1)
      expect(button.props().onClick).toEqual(mock)
    })
  })

  describe('Verify button Tests', () => {
    let anotherWrapper = shallow(<MfaForm maskedEmail="a@test.com" code="" onCodeChange={mock} onValidate={mock} disableVerify={false} countDown={countDown}/>)
    let button = anotherWrapper.find('.validate-button')
    it('contains verify button', () => {
      expect(button).toHaveLength(1)
    })

    it('has correct text on submit button', () => {
      expect(button.props().children).toEqual('Verify')
    })

    it('calls correct callback onClick', () => {
      expect(button).toHaveLength(1)
      expect(button.props().onClick).toEqual(mock)
    })

    it('checks if submit button is disabled', () => {
      expect(button.props().disabled).toEqual(true)
    })

    it('checks if submit button is not disabled', () => {
      anotherWrapper = shallow(<MfaForm maskedEmail="a@test.com" code="the_code" onCodeChange={mock} onValidate={mock} disableVerify={false} countDown={countDown}/>)
      button = anotherWrapper.find('.validate-button')
      expect(button.props().disabled).toEqual(false)
    })

    it('checks if the button text is changed', () => {
      anotherWrapper = shallow(<MfaForm maskedEmail="a@test.com" code="the_code" onCodeChange={mock} onValidate={mock} disableVerify={true} countDown={countDown}/>)
      button = anotherWrapper.find('.validate-button')
      expect(button.props().children).toEqual('Loading....')
    })
  })

  describe('Cancel button Tests', () => {
    const button = wrapper.find('#cancelButton')
    it('contains cancel button', () => {
      expect(button).toHaveLength(1)
    })

    it('has correct text on cancel button', () => {
      expect(button.props().children).toEqual('Cancel')
    })

    it('calls correct callback onClick', () => {
      expect(button).toHaveLength(1)
      expect(button.props().onClick).toEqual(mock)
    })
  })
})
