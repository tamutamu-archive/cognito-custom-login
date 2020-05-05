import React from 'react'
import PropTypes from 'prop-types'
import UserMessage from './UserMessage'
import PasswordInput from './PasswordInput'

const LoginForm = ({
  onSubmit,
  errorMsg,
  successMessage,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  disableSignIn,
  inputRef
}) => {
  return (
    <form>
      <span className='textDescription-customizable'>
        <h1>Log In</h1>
      </span>
      <UserMessage errorMessage={errorMsg} successMessage={successMessage} />
      <label className='label-customizable' htmlFor='email'>
        Email
      </label>
      <input
        id='email'
        ref={inputRef}
        name='email'
        type='text'
        className='form-control inputField-customizable'
        placeholder='Email'
        value={email}
        onChange={onEmailChange}
      />
      <br />
      <label className='label-customizable' htmlFor='password'>
        Password
      </label>
      <PasswordInput
        id='password'
        placeholder='Password'
        password={password}
        onChange={onPasswordChange}
      />
      {/* <a className='redirect-customizable' href='/forgotPassword'>Forgot your password?</a> */}
      <button
        className='btn btn-primary submitButton-customizable'
        id='submit'
        type='submit'
        onClick={onSubmit}
        disabled={!(email && password)}
      >
        {disableSignIn ? 'Loading....' : 'Sign In'}
      </button>
      <br />
      <br />
      <p className='Notice-This-system'>
        Notice:
        <br />
        This system is the property of the State of California and may be
        accessed only by authorized users. Unauthorized use of this system is
        strictly prohibited and may result in, but is not limited to,
        disciplinary action and criminal prosecution. The State of California
        may monitor any activity or communication on the system and retrieve any
        information stored within the system. By accessing and using this
        system, you are consenting to such monitoring and information retrieval
        for law enforcement and other purposes. Users have no expectation of
        privacy as to any communication on, or to any information stored within
        the system, or to any devices used to access this system.
      </p>
    </form>
  )
}
LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  errorMsg: PropTypes.string,
  successMessage: PropTypes.string,
  email: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  onEmailChange: PropTypes.func.isRequired,
  onPasswordChange: PropTypes.func.isRequired,
  disableSignIn: PropTypes.bool,
  inputRef: PropTypes.object
}

LoginForm.defaultProps = {
  email: '',
  password: ''
}

export default LoginForm
