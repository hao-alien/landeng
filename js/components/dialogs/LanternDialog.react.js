import { asyncDialog } from '../../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'
import Dialog from 'material-ui/lib/dialog'

import Language from './Language.react'
import Mobile from './Mobile.react'
import SignIn from './SignIn.react'


class LanternDialog extends React.Component {
  constructor(props) {
    super(props)
    this._handleClose = this._handleClose.bind(this)
  }

  _handleClose() {
    this.props.dispatch(asyncDialog({ open: false, name: '', title: '' }))
  }

  render() {
    const { dialog } = this.props.data
    const components = {
      'signin': <SignIn />,
      'language': <Language />,
      'mobile': <Mobile />,
    }

    return (
      <div>
        <Dialog
          title={dialog.title}
          modal={false} /* Close at clicking the background */
          open={dialog.open}
          onRequestClose={this._handleClose}>
          {components[dialog.name]}
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
