import React from 'react'
import {customErrorMessage, customErrorMfaMessage, secondstoTime} from '../utils/CommonHelper'
import mockAxios from 'axios'

describe('Return custom error messages comparing default error messages from the amazon cognito', () => {
  it('displays custom message when both email is empty', () => {
    const input = 'Missing required parameter USERNAME'
    const output = 'Email is required.'
    expect(customErrorMessage(input)).toEqual(output)
  })

  it('displays custom error message when user is expired', () => {
    const input = 'User account has expired, it must be reset by an administrator.'
    const output = 'Your temporary password has expired and must be reset by an administrator.'
    expect(customErrorMessage(input)).toEqual(output)
  })

  it('displays custom error message when user is expired', () => {
    const input = 1
    const output = <span>Error. Incorrect code. You have <b>1</b> attempt remaining.</span>
    expect(customErrorMfaMessage(input)).toEqual(output)
  })

  it('displays custom error message when user is expired', () => {
    const input = 2
    const output = <span>Error. Incorrect code. You have <b>2</b> attempts remaining.</span>
    expect(customErrorMfaMessage(input)).toEqual(output)
  })

  it('displays default error message', () => {
    const input = 'some message'
    const output = 'some message'
    expect(customErrorMessage(input)).toEqual(output)
  })

  it.only('displays correct message when 1 more attempts remaining', async () => {
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          'loginData': {
            'accountLockedTime': '-1',
            'numLoginAttempts': '1',
            'accountLocked': 'false',
            'remainingLoginAttempts': 1
          }
        }
      })
    )

    const input = 'PreAuthentication failed with error Login was not successful - 2.'
    await expect(customErrorMessage(input)).resolves.toEqual((<span>Login Error.  Incorrect Username or Password. You have <b>1</b> attempt remaining.</span>))
  })

  it('displays correct message when 2 more attempts remaining', async () => {
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          'loginData': {
            'accountLockedTime': '-1',
            'numLoginAttempts': '1',
            'accountLocked': 'false',
            'remainingLoginAttempts': 2
          }
        }
      })
    )

    const input = 'Incorrect username or password.'
    await expect(customErrorMessage(input)).resolves.toEqual((<span>Login Error.  Incorrect Username or Password. You have <b>2</b> attempts remaining.</span>))
  })

  it('displays correct message when 0 attempts remaining', async () => {
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          'loginData': {
            'accountLockedTime': '-1',
            'numLoginAttempts': '1',
            'accountLocked': 'false',
            'remainingLoginAttempts': 0
          }
        }
      })
    )

    const input = 'Incorrect username or password.'
    await expect(customErrorMessage(input)).resolves.toEqual((<span>Too many failed login attempts.  Please contact your CWDS-CARES Admin for assistance</span>))
  })
})

describe('#secondstoTime', () => {
  it('converts countDown value to minutes and seconds', () => {
    const input = 178
    const output = '2:58'
    expect(secondstoTime(input)).toEqual(output)
  })

  it('adds 0 to seconds when there are less than 10 seconds', () => {
    const input = 128
    const output = '2:08'
    expect(secondstoTime(input)).toEqual(output)
  })
})
