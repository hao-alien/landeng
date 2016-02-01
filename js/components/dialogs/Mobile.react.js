import React from 'react'
import TextField from 'material-ui/lib/text-field'
import RaisedButton from 'material-ui/lib/raised-button'
import IconEmail from 'material-ui/lib/svg-icons/communication/email'
import IllustratedDialog from './IllustratedDialog.react'
import styles from '../../constants/Styles'

class MobileDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      errorText: '',
    }
    this._emailValidation = this._emailValidation.bind(this)
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
      <IllustratedDialog
        title="Get Mobile Version"
        icon = {this.props.icon}
        illustration = "mobile.svg">
        <h4>Receive Lantern for Android via email</h4>
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
          <RaisedButton
            label="Send Mobile Version"
            className="button__blue"
            labelStyle={styles.buttonBlue}
            onTouchTap={this._emailValidation}
          />
        </div>
      </IllustratedDialog>
    )
  }
}
MobileDialog.propTypes = {
  icon: React.PropTypes.object,
}

export default MobileDialog
