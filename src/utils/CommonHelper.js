import React from 'react'
import axios from 'axios'

export const customErrorMessage = (errorMessage, email) => {
  const customMessage = {
    'Missing required parameter USERNAME': 'Email is required.',
    'User account has expired, it must be reset by an administrator.': 'Your temporary password has expired and must be reset by an administrator.',
    'PreAuthentication failed with error Login was not successful - 3.': (<span>Too many failed login attempts. Please reset your password or contact your CWS-CARES administrator for assistance.</span>),
    'PreAuthentication failed with error Login was not successful - 2.': (<span>Login Error.  Incorrect Username or Password. You have <b>1</b> attempt remaining.</span>),
    'PreAuthentication failed with error Login was not successful - 1.': (<span>Login Error.  Incorrect Username or Password. You have <b>2</b> attempts remaining.</span>),
    'PreAuthentication failed with error Account Locked Out.': (<span>Too many failed login attempts. Please reset your password or contact your CWS-CARES administrator for assistance.</span>),
    'default': errorMessage
  }

  return Promise.resolve(customMessage[errorMessage] || customMessage.default)
}

export const secondstoTime = seconds => {
  const secondsPerMinute = 60
  const tenSeconds = 10
  const min = Math.floor(seconds / secondsPerMinute)
  const sec = seconds % secondsPerMinute
  const formattedSeconds = sec < tenSeconds ? `0${sec}` : sec
  return `${min}:${formattedSeconds}`
}

export const customErrorMfaMessage = count => {
  const customMessage = {
    1: (<span>Error. Incorrect code. You have <b>1</b> attempt remaining.</span>),
    2: (<span>Error. Incorrect code. You have <b>2</b> attempts remaining.</span>),
    default: 'Something Went Wrong'
  }
  return customMessage[count] || customErrorMessage.default
}
