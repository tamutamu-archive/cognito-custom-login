export function validatePassword (instance, newPassword) {
  newPassword.match(/.{8,}$/gm) ? instance.setState({maxLength: true}) : instance.setState({maxLength: false})
  newPassword.match(/([a-z])/gm) ? instance.setState({lowerCase: true}) : instance.setState({lowerCase: false})
  newPassword.match(/([A-Z])/gm) ? instance.setState({upperCase: true}) : instance.setState({upperCase: false})
  newPassword.match(/([0-9])/gm) ? instance.setState({number: true}) : instance.setState({number: false})
  newPassword.match(/(\W)/gm) ? instance.setState({specialCharacter: true}) : instance.setState({specialCharacter: false})
}
