import 'jsdom-global/register'
import React from 'react'
import { mount, shallow } from 'enzyme'
import PasswordInput from './PasswordInput'

describe('PasswordInput.js Tests', () => {
  const mockOnChange = jest.fn()
  it('should display nothing by default', () => {
    const wrapper = shallow(<PasswordInput onChange={mockOnChange} capslock={false}/>)

    expect(wrapper.find('Alert').length).toBe(0)
  })

  it('should display the warning when capslock is detected', () => {
    const wrapper = shallow(<PasswordInput onChange={mockOnChange} capslock={false}/>)
    wrapper.setState({ capslock: true })

    expect(wrapper.find('Alert').length).toBe(1)
  })

  it('contains text input for password', () => {
    const ariaLabel = 'my label'
    const wrapper = shallow(<PasswordInput id={'password'} ariaLabelledBy={ariaLabel} onChange={mockOnChange} capslock={false}/>)
    const input = wrapper.find('input')
    expect(input).toHaveLength(1)

    expect(input.props().id).toEqual('password')
    expect(input.props().placeholder).toEqual('Password')
    expect(input.props()['aria-labelledby']).toEqual('my label')
  })

  describe('handleKeyDown', () => {
    const wrapper = shallow(<PasswordInput onChange={mockOnChange} capslock={true}/>)
    const mockModiferCapslockState = jest.fn()
    mockModiferCapslockState.mockReturnValue(true)
    const mockNormalState = jest.fn()
    mockNormalState.mockReturnValue(false)

    it('detects capslock in an event', () => {
      const instance = wrapper.instance()
      instance.setState({ capslock: false })
      const myEvent = { key: 'A', getModifierState: mockModiferCapslockState }
      instance.handleKeydown(myEvent)
      expect(mockModiferCapslockState).toBeCalledWith('CapsLock')
      expect(instance.state.capslock).toBe(true)
    })

    it('detects no capslock when not pressed', () => {
      const instance = wrapper.instance()
      instance.setState({ capslock: true })
      const myEvent = { key: 'A', getModifierState: mockNormalState }

      instance.handleKeydown(myEvent)
      expect(mockNormalState).toBeCalledWith('CapsLock')
      expect(instance.state.capslock).toBe(false)
    })
  })
})
