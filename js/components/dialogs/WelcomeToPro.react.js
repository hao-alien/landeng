import React from 'react'
import RaisedButton from 'material-ui/lib/raised-button'
import IconFace from 'material-ui/lib/svg-icons/image/tag-faces'

import IllustratedDialog from './IllustratedDialog.react'

class WelcomeToProDialog extends React.Component {
  invite() {
    // TODO: dispatch actions
  }

  close() {
    // TODO: dispatch actions
  }

  render() {
    return (
      <IllustratedDialog title="Welcome To Lantern PRO" icon = {<IconFace color="white"/>} illustration = "welcome-to-lantern-pro.svg">
        <h4>Thanks for your purchase of Lantern PRO!</h4>
        <p>Invite friends and you will both get a free month of Lantern PRO when they sign up. Start inviting!</p>
        <div id="mobile_input">
          <RaisedButton label="Invite Friends" onTouchTap={this.invite} />
        </div>
        <a onTouchTap={this.close}>Continue to PRO</a>
      </IllustratedDialog>)
  }
}

export default WelcomeToProDialog
