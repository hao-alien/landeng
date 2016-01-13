import { asyncDialog } from '../../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'
import TextField from 'material-ui/lib/text-field'
import RaisedButton from 'material-ui/lib/raised-button'
import IconEmail from 'material-ui/lib/svg-icons/communication/email'


const iconStyles = {
  marginRight: 10,
}

class Mobile extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      errorText: '',
    }
    this._handleClose = this._handleClose.bind(this)
    this._emailValidation = this._emailValidation.bind(this)
  }

  _handleClose() {
    this.props.dispatch(asyncDialog({ open: false, name: '', title: '' }))
  }

  _emailValidation() {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (re.test( this.refs.email.getValue() )) {
      this.setState({ errorText: '' })
    } else {
      this.setState({ errorText: 'Write a valid email address' })
    }
  }

  render() {
    return (
      <div>
        <IconEmail style={iconStyles} />
        <TextField
          hintText="Enter your email address"
          floatingLabelText="Email"
          errorText={this.state.errorText}
          ref="email" />
        <RaisedButton label="Send Mobile Version" onTouchTap={this._emailValidation} />
      </div>
    )
  }
}

Mobile.propTypes = {
  data: React.PropTypes.object,
  dispatch: React.PropTypes.func,
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state,
  }
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(Mobile)
