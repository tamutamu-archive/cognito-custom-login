import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Alert } from '@cwds/components'

class PasswordInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = { capslock: false }

    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  render () {
    const { password, onChange, ariaLabelledBy, placeholder, tabIndex, inputRef } = this.props
    return (<React.Fragment>
      <input id={this.props.id} ref={inputRef} name='password' type='password' className='form-control inputField-customizable'
        placeholder={placeholder} value={password} onChange={onChange} onClick={(event) => this.handleKeyPress(event)}
        onKeyUp={(event) => this.handleKeyPress(event)} onKeyDown={(event) => this.handleKeyPress(event)} aria-labelledby={ariaLabelledBy} tabIndex={tabIndex} />
      {this.state.capslock && <Alert className='errorMessage-customizable' color='danger'>Caps Lock is on</Alert>}
    </React.Fragment>
    )
  }

  handleKeyPress (event) {
    const caps = event.getModifierState !== undefined && event.getModifierState('CapsLock')
    this.setState(state => ({
      capslock: caps
    }))
  }
}

PasswordInput.propTypes = {
  id: PropTypes.string,
  password: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  ariaLabelledBy: PropTypes.string,
  placeholder: PropTypes.string,
  tabIndex: PropTypes.string,
  inputRef: PropTypes.object
}
export default PasswordInput
