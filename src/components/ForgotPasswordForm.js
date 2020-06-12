import React from 'react'
import PropTypes from 'prop-types'
import UserMessage from './UserMessage'
import { Button } from '@cwds/reactstrap'

const ForgotPasswordForm = ({
  errorMsg,
  email,
  onChange,
  onSubmit,
  disableResetPassword,
  onCancel,
  inputRef
}) => {
  return (
    <form>
      <h1 style={{ color: 'red' }}>Admin Use Only</h1>
      <UserMessage errorMessage={errorMsg} />
      <br />
      <label htmlFor='email' className='label-customizable'>
        Enter your login email below and we will send a message to reset your
        password
      </label>
      <input
        name='emal'
        ref={inputRef}
        id='email'
        className='form-control inputField-customizable'
        type='text'
        placeholder='Email'
        value={email}
        onChange={onChange}
        aria-labelledby='email_label'
        tabIndex='1'
      />
      <div className='submit-block'>
        <Button type='button' id='cancelButton' onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type='submit'
          id='validateButton'
          color='primary'
          disabled={!email || disableResetPassword}
          onClick={onSubmit}
          tabIndex='2'
        >
          {disableResetPassword ? 'Loading....' : 'Reset my password'}
        </Button>
      </div>
    </form>
  )
}

ForgotPasswordForm.propTypes = {
  email: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  errorMsg: PropTypes.string,
  disableResetPassword: PropTypes.bool,
  onCancel: PropTypes.func,
  inputRef: PropTypes.object
}

export default ForgotPasswordForm
