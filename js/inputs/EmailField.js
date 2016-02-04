import React, { Component } from 'react'
import TextField from 'material-ui/lib/text-field'

class EmailField extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      errorMail: '',
    }
    this._emailValidation = this._emailValidation.bind(this)
  }

  getValue() {
    return this._emailValidation() ? this._input.getValue() : null
  }

  _emailValidation() {
    const re = /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    let value = false
    if (re.test( this._input.getValue() )) {
      this.setState({ errorMail: '' })
      value = true
    } else {
      this.setState({ errorMail: this.props.errorMail})
      value = false
    }
    return value
  }

  render() {
    return (
      <TextField
      style={this.props.style}
      type="email"
      hintText={this.props.hintText}
      floatingLabelText={this.props.floatingLabelText}
      errorText={this.state.errorMail || this.props.errorText}
      onBlur={this._emailValidation}
      ref={(c) => this._input = c} />
    )
  }
}

EmailField.propTypes = {
  style: React.PropTypes.object,
  errorText: React.PropTypes.string,
  errorMail: React.PropTypes.string,
  hintText: React.PropTypes.string,
  floatingLabelText: React.PropTypes.string,
}

export default EmailField
