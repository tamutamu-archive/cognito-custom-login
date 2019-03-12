import 'jsdom-global/register'
import React from 'react'
import { shallow } from 'enzyme'
import PasswordInput from './PasswordInput'

describe('PasswordInput.js Tests', () => {
  const mockOnChange = jest.fn()
  it('should display nothing by default', () => {
    const wrapper = shallow(<PasswordInput onChange={mockOnChange} capslock={false} />)

    expect(wrapper.find('Alert').length).toBe(0)
  })

  it('should display the warning when capslock is detected', () => {
    const wrapper = shallow(<PasswordInput onChange={mockOnChange} capslock={false} />)
    wrapper.setState({ capslock: true })

    expect(wrapper.find('Alert').length).toBe(1)
  })

  it('contains text input for password', () => {
    const ariaLabel = 'my label'
    const wrapper = shallow(<PasswordInput id={'password'} ariaLabelledBy={ariaLabel} onChange={mockOnChange} capslock={false} placeholder='some holder' tabIndex='1' />)
    const input = wrapper.find('input')
    expect(input).toHaveLength(1)

    expect(input.props().id).toEqual('password')
    expect(input.props().placeholder).toEqual('some holder')
    expect(input.props().tabIndex).toEqual('1')
    expect(input.props()['aria-labelledby']).toEqual('my label')
  })

  describe('handleKeyPress', () => {
    const wrapper = shallow(<PasswordInput onChange={mockOnChange} capslock={true} />)
    const instance = wrapper.instance()
    const mockModiferCapslockState = jest.fn()
    mockModiferCapslockState.mockReturnValue(true)
    const mockNormalState = jest.fn()
    mockNormalState.mockReturnValue(false)

    it('detects capslock-ON when keydown event in input element', () => {
      instance.setState({ capslock: false })
      const myEvent = { key: 'A', getModifierState: mockModiferCapslockState }
      instance.handleKeyPress(myEvent)
      expect(mockModiferCapslockState).toBeCalledWith('CapsLock')
      expect(instance.state.capslock).toBe(true)
    })

    it('detects capslock-ON when click event on input element', () => {
      const mockEvent = { getModifierState: mockModiferCapslockState }
      instance.setState({ capslock: false })
      const mockFunc = jest.spyOn(instance, 'handleKeyPress')
      const input = wrapper.find('input')
      input.simulate('click', mockEvent)
      expect(mockFunc).toHaveBeenCalledWith(mockEvent)
      expect(instance.state.capslock).toBe(true)
    })

    it('detects no capslock when not pressed', () => {
      instance.setState({ capslock: true })
      const myEvent = { key: 'A', getModifierState: mockNormalState }

      instance.handleKeyPress(myEvent)
      expect(mockNormalState).toBeCalledWith('CapsLock')
      expect(instance.state.capslock).toBe(false)
    })
  })
})
