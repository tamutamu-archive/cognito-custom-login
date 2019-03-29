import React from 'react'
import PropTypes from 'prop-types'
import UserMessage from './UserMessage'
import PasswordInput from './PasswordInput'
import { Button } from '@cwds/components'
import { secondstoTime } from './../utils/CommonHelper'

const MfaForm = ({ maskedEmail, code, onCodeChange, onValidate, disableVerify, onCancel, errorMsg, countDown, inputRef, onResend }) => {
  return (
    <form>
      <div id="div-forgot-password-msg">
        <UserMessage errorMessage={errorMsg} />
        <h1>Account Verification Required</h1>
        <br />
        <p className='mfa-instructions'>For additional security, we need to verify your account on this device.</p>
        <br />
        <p className='mfa-instructions'>An email was sent to {maskedEmail} with a unique verification code. Please enter that code below.</p>
        <br />
        <p className='countDown'><b>Expires in: {secondstoTime(countDown)}</b></p>
      </div>
      <br />
      <label htmlFor='code'>Verification Code</label>
      <PasswordInput
        id="code"
        placeholder='Enter Code Here'
        password={code}
        onChange={onCodeChange}
        tabIndex='1'
        inputRef={inputRef} />
      <div className='submit-block'>
        <span><b>Not Working?</b>
          <div>
            <Button
              id="resendButton"
              className='resend-button'
              color="link"
              size='lg'
              onClick={onResend}>
             Resend
            </Button>
          </div>
        </span>
        <span>
          <Button
            size='lg'
            type="button"
            id="cancelButton"
            onClick={onCancel}>
          Cancel
          </Button>
          <Button
            color='primary'
            size='lg'
            type='submit'
            id="validateButton"
            className="validate-button btn btn-primary"
            disabled={!code || disableVerify}
            onClick={onValidate}
            tabIndex='2'>
            {disableVerify ? 'Loading....' : 'Verify'}
          </Button>
        </span>
      </div>
    </form>
  )
}

MfaForm.propTypes = {
  maskedEmail: PropTypes.string,
  code: PropTypes.string,
  onCodeChange: PropTypes.func.isRequired,
  onValidate: PropTypes.func.isRequired,
  disableVerify: PropTypes.bool,
  onCancel: PropTypes.func,
  errorMsg: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  countDown: PropTypes.number,
  inputRef: PropTypes.object,
  onResend: PropTypes.func
}

export default MfaForm
