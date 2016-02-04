import React from 'react'
import { connect } from 'react-redux'
import RaisedButton from 'material-ui/lib/raised-button'
import IconEmail from 'material-ui/lib/svg-icons/communication/email'
import { translate } from 'react-i18next/lib'
import ga from 'react-google-analytics'

import IllustratedDialog from './IllustratedDialog.react'
import styles from '../../constants/Styles'
import EmailField from '../../inputs/EmailField'
import {asyncSendMobileLink, trackSendMobileLink} from '../../actions/3rdAPIActions'

class MobileDialog extends React.Component {
  sendMail() {
    const mail = this._input.getValue()
    if (mail) {
      this.props.dispatch(asyncSendMobileLink(mail))
      this.props.dispatch(trackSendMobileLink())
    }
  }
  render() {
    const { t } = this.props
    const GAInitiailizer = ga.Initializer;

    return (
      <IllustratedDialog
        title="Get Mobile Version"
        icon = {this.props.icon}
        illustration = "mobile.svg">
        <GAInitiailizer />
        <h4>Receive Lantern for Android via email</h4>
        <div className="input_inline">
          <div className="input_inline_icon">
            <IconEmail style={styles.iconStyles} />
          </div>
          <div className="input_inline_text">
            <EmailField
              style={styles.textInputInline}
              hintText={t('input.enter_email')}
              floatingLabelText={t('input.email')}
              errorMail = {t('input.use_valid_email')}
              errorText = {t(this.props.error)}
              ref={(c) => this._input = c} />
          </div>
        </div>
        <div id="mobile_input">
          <RaisedButton
            label="Send Mobile Version"
            className="button__blue"
            labelStyle={styles.buttonBlue}
            onTouchTap={this.sendMail.bind(this)}
          />
        </div>
      </IllustratedDialog>
    )
  }
}

MobileDialog.propTypes = {
  icon: React.PropTypes.object,
  t: React.PropTypes.func,
  error: React.PropTypes.string,
  dispatch: React.PropTypes.func,
}

export default translate(['translation'])(connect()(MobileDialog))
