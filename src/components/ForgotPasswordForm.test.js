/* eslint "no-magic-numbers": [0, { "enforceConst": true, "ignore": [-1,0,1,2] }] */

import React from 'react'
import { shallow } from 'enzyme'
import ForgotPasswordForm from './ForgotPasswordForm'
import UserMessage from './UserMessage'

describe('ForgotPasswordForm.js Tests', () => {
  it('should require correct params', () => {
    const mock = jest.fn()
    // eslint-disable-next-line no-console
    console.error = mock

    shallow(<ForgotPasswordForm/>)

    expect(mock).toHaveBeenCalledTimes(3)
    const concat = [].concat(...mock.mock.calls)

    expect(concat.some((element) => { return element.includes('`email` is marked as required') })).toBe(true)
    expect(concat.some((element) => { return element.includes('`onChange` is marked as required') })).toBe(true)
    expect(concat.some((element) => { return element.includes('`onSubmit` is marked as required') })).toBe(true)
  })

  it('should display `Password Reset` at top', () => {
    const wrapper = shallow(<ForgotPasswordForm/>)

    const h1 = wrapper.find('h1')

    expect(h1).toHaveLength(1)
    expect(h1.text()).toEqual('Password Reset')
  })

  it('should pass errorMsg to <UserMessage>', () => {
    const mock = jest.fn()
    const wrapper = shallow(<ForgotPasswordForm email="a" onChange={mock} onSubmit={mock} errorMsg="some_message"/>)

    const UserMessageTag = wrapper.find(UserMessage)
    expect(UserMessageTag).toHaveLength(1)
    expect(UserMessageTag.props().errorMessage).toEqual('some_message')
  })

  it('should display instructions', () => {
    const wrapper = shallow(<ForgotPasswordForm/>)

    const label = wrapper.find('label')

    expect(label).toHaveLength(1)
    expect(label.text()).toEqual('Enter your login email below and we will send a message to reset your password')
  })

  it('contains text input for email', () => {
    const mock = jest.fn()
    const wrapper = shallow(<ForgotPasswordForm email="a" onChange={mock} onSubmit={mock}/>)

    const input = wrapper.find('input')

    expect(input).toHaveLength(1)
    expect(input.props().id).toEqual('email')
    expect(input.props().placeholder).toEqual('Email')
  })

  it('lets component manage email value', () => {
    const onChange = jest.fn()
    const onSubmit = jest.fn()
    const wrapper = shallow(<ForgotPasswordForm email="a@test.com" onChange={onChange} onSubmit={onSubmit}/>)

    const input = wrapper.find('input')

    expect(input).toHaveLength(1)
    expect(input.props().value).toEqual('a@test.com')
  })

  it('calls correct callback onChange', () => {
    const onChange = jest.fn()
    const onSubmit = jest.fn()
    const wrapper = shallow(<ForgotPasswordForm email="a@test.com" onChange={onChange} onSubmit={onSubmit}/>)

    const input = wrapper.find('input')

    expect(input).toHaveLength(1)
    expect(input.props().onChange).toEqual(onChange)
  })

  it('contains submit button and cancel button', () => {
    const onChange = jest.fn()
    const onSubmit = jest.fn()
    const wrapper = shallow(<ForgotPasswordForm email="a@test.com" onChange={onChange} onSubmit={onSubmit}/>)

    const button = wrapper.find('Button')

    expect(button).toHaveLength(2)
  })

  it('has correct text on submit button', () => {
    const onChange = jest.fn()
    const onSubmit = jest.fn()
    const wrapper = shallow(<ForgotPasswordForm email="a@test.com" onChange={onChange} onSubmit={onSubmit}/>)

    const button = wrapper.find('Button')

    expect(button.at(1).props().children).toEqual('Reset my password')
  })

  it('calls correct callback onClick', () => {
    const onChange = jest.fn()
    const onSubmit = jest.fn()
    const wrapper = shallow(<ForgotPasswordForm email="a@test.com" onChange={onChange} onSubmit={onSubmit}/>)

    const button = wrapper.find('Button')

    expect(button).toHaveLength(2)
    expect(button.at(1).props().onClick).toEqual(onSubmit)
  })

  it('has correct text on cancel button', () => {
    const onChange = jest.fn()
    const onSubmit = jest.fn()
    const onCancel = jest.fn()
    const wrapper = shallow(<ForgotPasswordForm email="a@test.com" onChange={onChange} onSubmit={onSubmit} onCancel={onCancel}/>)

    const button = wrapper.find('Button')

    expect(button.at(0).props().children).toEqual('Cancel')
  })

  it('calls correct callback onClick', () => {
    const onChange = jest.fn()
    const onSubmit = jest.fn()
    const onCancel = jest.fn()
    const wrapper = shallow(<ForgotPasswordForm email="a@test.com" onChange={onChange} onSubmit={onSubmit} onCancel={onCancel}/>)

    const button = wrapper.find('Button')

    expect(button.at(0).props().onClick).toEqual(onCancel)
  })

  it('shows Loading state', () => {
    const onChange = jest.fn()
    const onSubmit = jest.fn()
    const onCancel = jest.fn()
    const wrapper = shallow(<ForgotPasswordForm disableResetPassword={true} email="a@test.com" onChange={onChange} onSubmit={onSubmit} onCancel={onCancel}/>)

    const button = wrapper.find('Button')

    expect(button.at(1).props().children).toEqual('Loading....')
  })
})
