import React from 'react'
import Dialog from 'material-ui/lib/dialog'
import FlatButton from 'material-ui/lib/flat-button'

export default class SignIn extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: true,
    }
    this._handleClose = this._handleClose.bind(this)
  }

  _handleClose() {
    this.setState({open: false})
  }

  render() {
    const that = this
    const actions = [
      <FlatButton
        label="Cancel"
        secondary
        onTouchTap={that._handleClose} />,
      <FlatButton
        label="Submit"
        primary
        keyboardFocused
        onTouchTap={that._handleClose} />,
    ]

    return (
      <div>
        <Dialog
          title="Sign In"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this._handleClose}>
          Sign In
        </Dialog>
      </div>
    )
  }
}

SignIn.propTypes = {
}
