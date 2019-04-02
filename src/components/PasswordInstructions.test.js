/* eslint "no-magic-numbers": [0, { "enforceConst": true, "ignore": [-1,0,1,2] }] */

import 'jsdom-global/register'
import React from 'react'
import { shallow } from 'enzyme'
import PasswordInstructions from './PasswordInstructions'

describe('PasswordInstructions.js Tests', () => {
  it('should display nothing with undefined message', () => {
    const wrapper = shallow(<PasswordInstructions/>)
    expect(wrapper.find('div')).toHaveLength(3)
  })

  it('should display the PasswordInstructions', () => {
    const props = {validateNumber: false, validateLowerCase: false, validateLength: false, validateUpperCase: false, validateSpecialCharacter: false}
    const wrapper = shallow(<PasswordInstructions props={props}/>)
    expect(wrapper.find('div').at(1).text()).toBe('× Minimum 8 characters× Lower case letter [a-z]× Upper case letter [A-Z]')
    expect(wrapper.find('div').at(2).text()).toBe('× Numeric character [0-9]× Special character <Icon /><UncontrolledTooltip />')
  })
  it('should pop up to display special characters', () => {
    const props = {validateNumber: false, validateLowerCase: false, validateLength: false, validateUpperCase: false, validateSpecialCharacter: false}
    const wrapper = shallow(<PasswordInstructions/>)
    expect(wrapper.find('UncontrolledTooltip').length).toBe(1)
    expect(wrapper.find('UncontrolledTooltip').props().children).toBe("^ $ * . [ ] { } ( ) ? - \" ! @ # % & / \\ , > < ' : ; | _ ~ `")
  })
})
