import React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import Root from './components/Root'
import './assets/stylesheets/cognito-login.css'
import './assets/stylesheets/custom-css.css'

render(
  <AppContainer>
    <Root/>
  </AppContainer>,
  document.getElementById('app')
)

if (module.hot) {
  module.hot.accept('./components/Root', () => {
    const NewRoot = require('./components/Root').default
    render(
      <AppContainer>
        <NewRoot/>
      </AppContainer>,
      document.getElementById('app')
    )
  })
}
