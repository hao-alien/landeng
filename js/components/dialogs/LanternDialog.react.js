import { asyncDialog } from '../../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'
import Dialog from 'material-ui/lib/dialog'
import FlatButton from 'material-ui/lib/flat-button'

class LanternDialog extends React.Component {
  constructor(props) {
    super(props)
    this._handleClose = this._handleClose.bind(this)
  }

  _handleClose() {
    this.props.dispatch(asyncDialog({ open: false, name: '', title: '' }))
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
    const { dialog } = this.props.data

    return (
      <div>
        <Dialog
          title={dialog.title}
          actions={actions}
          modal={false}
          open={dialog.open}
          onRequestClose={this._handleClose}>
          Sign In
        </Dialog>
      </div>
    )
  }
}

LanternDialog.propTypes = {
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
export default connect(select)(LanternDialog)
