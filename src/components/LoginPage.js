import React, { Component } from 'react'
import { customErrorMessage, customErrorMfaMessage } from '../utils/CommonHelper'
import { validatePassword } from '../utils/validatePassword'
import qs from 'query-string'
import LoginForm from './LoginForm'
import MfaForm from './MfaForm'
import NewPasswordRequiredForm from './NewPasswordRequiredForm'
import * as Auth from '../utils/Auth'
import { MODE, mfaMessages, updatePasswordMessages, mfaTotalAttempts } from '../utils/constants'
import CodeExpired from './CodeExpired'

class LoginPage extends Component {
  constructor (props, context) {
    super(props, context)
    this.timer = 0
    this.inputRef = React.createRef()

    this.state = {
      mode: MODE.LOGIN,
      errorMsg: undefined,
      email: '',
      password: '',
      code: '',
      cognitoJson: '{}',
      newPassword: '',
      confirmPassword: '',
      disableSignIn: false,
      disableVerify: false,
      maxLength: false,
      lowerCase: false,
      upperCase: false,
      number: false,
      specialCharacter: false,
      MfaAttemptsRemaining: 3,
      countDown: 178,
      userMsg1: '',
      userMsg2: ''
    }
    this.login = this.login.bind(this)
    this.validate = this.validate.bind(this)
    this.showValidationArea = this.showValidationArea.bind(this)
    this.showError = this.showError.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
    this.setCognitoToken = this.setCognitoToken.bind(this)
    this.submitFormToPerry = this.submitFormToPerry.bind(this)
    this.changePassword = this.changePassword.bind(this)
    this.showNewPasswordRequiredArea = this.showNewPasswordRequiredArea.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.startTimer = this.startTimer.bind(this)
  }

  componentDidMount () {
    this.inputRef.current.focus()
  }

  componentDidUpdate (prevProps, prevState) {
    const modesArray = Object.values(MODE)
    if (prevState.mode !== this.state.mode && modesArray.includes(this.state.mode) && this.state.mode !== MODE.CODE_EXPIRED) {
      this.inputRef.current.focus()
    }
  }

  onInputChange (event) {
    this.setState({ [event.target.id]: event.target.value })
    if (event.target.id === 'newPassword') {
      validatePassword(this, event.target.value)
    }
  }

  showValidationArea (maskedEmail) {
    this.setState({
      mode: MODE.VALIDATING,
      maskedEmail: maskedEmail,
      countDown: 178,
      errorMsg: '',
      MfaAttemptsRemaining: 3
    })
    const intervalTime = 1000
    this.timer = setInterval(this.startTimer, intervalTime)
  }

  startTimer () {
    const mfaCount = 3
    const duration = this.state.countDown
    const showError = this.showError
    if (duration > 1) {
      this.setState({
        countDown: duration - 1
      })
    } else {
      this.state.mode === 2 ? showError(mfaMessages.errorMsg, MODE.CODE_EXPIRED, mfaCount, mfaMessages)
        : showError(updatePasswordMessages.errorMsg, MODE.CODE_EXPIRED, mfaCount, updatePasswordMessages)
      clearInterval(this.timer)
    }
  }

  showNewPasswordRequiredArea () {
    this.setState({mode: MODE.NEW_PASSWORD, errorMsg: ''})
    const intervalTime = 1000
    this.timer = setInterval(this.startTimer, intervalTime)
  }

  setCognitoToken (token) {
    this.setState({ cognitoJson: token })
    this.submitFormToPerry()
  }

  submitFormToPerry () {
    document.getElementById('login-form').submit()
  }

  showError (msg, mode = MODE.LOGIN, mfaCount = mfaTotalAttempts, cardMessages = {}, password = '') {
    this.setState({
      mode: mode,
      errorMsg: msg,
      password: password,
      newPassword: '',
      confirmPassword: '',
      code: '',
      disableSignIn: false,
      disableVerify: false,
      MfaAttemptsRemaining: mfaCount,
      userMsg1: cardMessages.userMsg1,
      userMsg2: cardMessages.userMsg2
    })
    if (mode !== MODE.CODE_EXPIRED) { this.inputRef.current.focus() }
  }

  validate (event) {
    event.preventDefault()
    const cognitoUser = this.state.cognitoUser
    const challengeResponses = `${this.state.code.trim()} ${cognitoUser.deviceKey}`
    const showError = this.showError
    const attemptsRemaining = this.state.MfaAttemptsRemaining
    const setCognitoToken = this.setCognitoToken
    const mfaCount = 3
    this.setState({disableVerify: true})
    cognitoUser.sendCustomChallengeAnswer(challengeResponses, {
      onSuccess: result => {
        setCognitoToken(JSON.stringify(result))
        clearInterval(this.timer)
      },
      onFailure: () => {
        const count = attemptsRemaining - 1
        const errorMessage = customErrorMfaMessage(count)
        if (count === 0) {
          showError('', MODE.LOGIN, mfaCount)
          clearInterval(this.timer)
        } else {
          showError(errorMessage, MODE.VALIDATING, count, {}, this.state.password)
        }
      }
    })
  }

  login (event) {
    clearInterval(this.timer)
    event.preventDefault()
    const showValidationArea = this.showValidationArea
    const showNewPasswordRequiredArea = this.showNewPasswordRequiredArea
    const props = this.props
    props.history.push({ msg: '' })
    const showError = this.showError
    const setCognitoToken = this.setCognitoToken

    const cognitoUser = Auth.createUser(this.state)
    this.setState({cognitoUser: cognitoUser, disableSignIn: true})
    cognitoUser.setAuthenticationFlowType('CUSTOM_AUTH')

    const authenticationDetails = Auth.authenticationDetails(this.state)
    cognitoUser.authenticateUserDefaultAuth(authenticationDetails, {
      newPasswordRequired: (userAttributes, requiredAttributes) => { showNewPasswordRequiredArea() },
      onFailure: err => {
        customErrorMessage(err.message, cognitoUser.username)
          .then(errorMessage => {
            showError(errorMessage)
          })
      },
      customChallenge: () => {
        // device challenge
        const challengeResponses = cognitoUser.deviceKey ? cognitoUser.deviceKey : 'null'
        cognitoUser.sendCustomChallengeAnswer(challengeResponses, {
          onSuccess: result => { setCognitoToken(JSON.stringify(result)) },
          onFailure: (err) => { return showError(err.message) },
          customChallenge: challengeParameters => { showValidationArea(challengeParameters.maskedEmail) }
        })
      }
    })
  }

  changePassword (event) {
    event.preventDefault()
    const showError = this.showError
    const cognitoUser = this.state.cognitoUser
    const setCognitoToken = this.setCognitoToken
    switch (this.state.confirmPassword) {
      case this.state.newPassword:
        cognitoUser.completeNewPasswordChallenge(this.state.newPassword, {}, {
          onSuccess: result => { setCognitoToken(JSON.stringify(result)) },
          onFailure: err => { showError(err.message, MODE.NEW_PASSWORD) }
        })
        break
      default: {
        this.setState({newPassword: '', confirmPassword: ''})
        showError('Passwords do not match', MODE.NEW_PASSWORD)
      }
    }
  }

  onCancel () {
    this.setState({
      disableSignIn: false,
      mode: MODE.LOGIN,
      errorMsg: '',
      MfaAttemptsRemaining: 3,
      countDown: 178,
      password: '',
      newPassword: '',
      confirmPassword: ''
    })
    clearInterval(this.timer)
  }

  renderMfaForm () {
    return <MfaForm
      disableVerify={this.state.disableVerify}
      maskedEmail={this.state.maskedEmail}
      code={this.state.code}
      onCodeChange={this.onInputChange}
      onValidate={event => this.validate(event)}
      onCancel={this.onCancel}
      errorMsg={this.state.errorMsg}
      countDown={this.state.countDown}
      inputRef={this.inputRef}
      onResend={event => this.login(event)} />
  }

  renderNewPasswordRequiredForm () {
    return <NewPasswordRequiredForm
      validateLength={this.state.maxLength}
      validateLowerCase={this.state.lowerCase}
      validateUpperCase={this.state.upperCase}
      validateNumber={this.state.number}
      validateSpecialCharacter={this.state.specialCharacter}
      errorMsg={this.state.errorMsg}
      confirmPassword={this.state.confirmPassword}
      newPassword={this.state.newPassword}
      onNewPasswordChange={this.onInputChange}
      onConfirmPasswordChange={this.onInputChange}
      onCancel={this.onCancel}
      sessionTime={this.state.countDown}
      onSubmit={event => this.changePassword(event)}
      inputRef={this.inputRef} />
  }

  renderLoginForm () {
    const props = this.props
    return <LoginForm
      onSubmit={event => this.login(event)}
      disableSignIn={this.state.disableSignIn}
      errorMsg={this.state.errorMsg}
      successMessage={props.history.location.msg}
      email={this.state.email}
      password={this.state.password}
      onEmailChange={this.onInputChange}
      onPasswordChange={this.onInputChange}
      inputRef={this.inputRef} />
  }

  renderCodeExpired () {
    return <CodeExpired
      onReturn={this.onCancel}
      userMsg1={this.state.userMsg1}
      userMsg2={this.state.userMsg2}
      errorMsg={this.state.errorMsg} />
  }

  render () {
    const perryLoginUrl = `${process.env.PERRY_URL}/perry/login`
    let comp
    switch (this.state.mode) {
      // MFA PAGE
      case MODE.VALIDATING:
        comp = this.renderMfaForm()
        break
      case MODE.NEW_PASSWORD:
        comp = this.renderNewPasswordRequiredForm()
        break
      case MODE.LOGIN:
        comp = this.renderLoginForm()
        break
      case MODE.CODE_EXPIRED:
        comp = this.renderCodeExpired()
        break
      default:
        this.showError('Unknown Request')
        break
    }
    return <React.Fragment>
      {comp}
      <form id='login-form' action={perryLoginUrl} method='post'>
        <input type='hidden' name="CognitoResponse" value={this.state.cognitoJson} />
      </form>
    </React.Fragment>
  }
}

LoginPage.defaultProps = {
  history: {
    location: { msg: '' }
  }
}

export default LoginPage
