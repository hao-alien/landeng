import React from 'react'
import RaisedButton from 'material-ui/lib/raised-button'
import IconEmail from 'material-ui/lib/svg-icons/communication/email'
import { translate } from 'react-i18next/lib';
import IllustratedDialog from './IllustratedDialog.react'
import styles from '../../constants/Styles'
import EmailField from '../../inputs/EmailField'

class MobileDialog extends React.Component {
  sendMail() {
    let mail = this._input.getValue()
    if (mail) {
      // TODO
    }
  }
  render() {
    const { t } = this.props
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
}

export default translate(['translation'])(MobileDialog)
