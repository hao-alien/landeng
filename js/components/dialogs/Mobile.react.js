import { asyncDialog } from '../../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'
import TextField from 'material-ui/lib/text-field'
import RaisedButton from 'material-ui/lib/raised-button'
import IconEmail from 'material-ui/lib/svg-icons/communication/email'

import styles from '../../constants/styles'

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
        <div id="mobile_header">
        </div>
        <div id="mobile_body">
          <p>Receive Lantern for Android via email</p>
          <div className="input_inline">
            <div className="input_inline_icon">
              <IconEmail style={styles.iconStyles} />
            </div>
            <div className="input_inline_text">
              <TextField
                hintText="Enter your email address"
                floatingLabelText="Email"
                style={styles.textInputInline}
                errorText={this.state.errorText}
                ref="email" />
            </div>
          </div>
          <div id="mobile_input">
            <RaisedButton label="Send Mobile Version" onTouchTap={this._emailValidation} />
          </div>
        </div>
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
