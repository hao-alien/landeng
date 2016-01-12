import { asyncOpenDialog } from '../../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'
import Dialog from 'material-ui/lib/dialog'
import FlatButton from 'material-ui/lib/flat-button'

class SignIn extends React.Component {
  constructor(props) {
    super(props)
    this._handleClose = this._handleClose.bind(this)
  }

  _handleClose() {
    this.props.dispatch(asyncOpenDialog(false))
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
    const { openDialog } = this.props.data

    return (
      <div>
        <Dialog
          title="Sign In"
          actions={actions}
          modal={false}
          open={openDialog}
          onRequestClose={this._handleClose}>
          Sign In
        </Dialog>
      </div>
    )
  }
}

SignIn.propTypes = {
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state,
  }
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(SignIn)
