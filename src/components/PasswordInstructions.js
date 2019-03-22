import React from 'react'
import PropTypes from 'prop-types'

export const Cross = () => {
  return <span className="text-danger">&times;</span>
}

export const Tick = () => {
  return <span className="text-success">&#10003;</span>
}

const PasswordInstructions = props => {
  return (
    <div className='passwordIndicatorSection'>
      <span>Password must contain the following:</span><br/>
      <div className="col-xs-6">
        <ul>
          <li>{props.validateLength ? Tick() : Cross()} Minimum 8 characters</li>
          <li>{props.validateLowerCase ? Tick() : Cross()} Lower case letter [a-z]</li>
          <li>{props.validateUpperCase ? Tick() : Cross()} Upper case letter [A-Z]</li>
        </ul>
      </div>
      <div className="col-xs-6">
        <ul>
          <li>{props.validateNumber ? Tick() : Cross()} Numeric character [0-9]</li>
          <li title="^ $ * . [ ] { } ( ) ? - &quot; ! @ # % &amp; / \ , > < ' : ; | _ ~ `">{props.validateSpecialCharacter ? Tick() : Cross()} Special character</li>
        </ul>
        <br/>
        <br/>
      </div>
    </div>
  )
}

PasswordInstructions.propTypes = {
  validateLowerCase: PropTypes.bool,
  validateSpecialCharacter: PropTypes.bool,
  validateUpperCase: PropTypes.bool,
  validateNumber: PropTypes.bool,
  validateLength: PropTypes.bool
}

export default PasswordInstructions
