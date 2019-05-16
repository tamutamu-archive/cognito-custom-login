import {AuthenticationDetails, CognitoUserPool, CognitoUser} from 'amazon-cognito-identity-js'

export function createUser (state) {
  const username = state.email.toLowerCase()
  const poolData = {
    UserPoolId: process.env.USER_POOL_ID,
    ClientId: process.env.CLIENT_ID
  }
  const userPool = new CognitoUserPool(poolData)
  const userData = {
    Username: username.trim(),
    Pool: userPool
  }
  return new CognitoUser(userData)
}

export function authenticationDetails (state) {
  const username = state.email.toLowerCase()
  const authenticationData = {
    Username: username.trim(),
    Password: state.password.trim(),
    ValidationData: {
      password: state.password.trim()
    }
  }

  return new AuthenticationDetails(authenticationData)
}
