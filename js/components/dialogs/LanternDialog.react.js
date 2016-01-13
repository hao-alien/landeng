import { asyncDialog } from '../../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'
import Dialog from 'material-ui/lib/dialog'
import ThemeManager from 'material-ui/lib/styles/theme-manager'
import LightTheme from 'material-ui/lib/styles/raw-themes/light-raw-theme'

import Checkout from './Checkout.react'
import Language from './Language.react'
import Mobile from './Mobile.react'
import Settings from './Settings.react'
import SignIn from './SignIn.react'

const customContentStyle = {
  width: '650px',
  // height: '500px',
}

class LanternDialog extends React.Component {
  constructor(props) {
    super(props)
    this._handleClose = this._handleClose.bind(this)
  }

  getChildContext() {
    return { muiTheme: ThemeManager.getMuiTheme(LightTheme) }
  }

  _handleClose() {
    this.props.dispatch(asyncDialog({ open: false, name: '', title: '' }))
  }

  render() {
    const { dialog } = this.props.data
    const components = {
      'lanternpro': <SignIn />,
      'checkout': <Checkout />,
      'signin': <Checkout />,
      'language': <Language />,
      'mobile': <Mobile />,
      'settings': <Settings />,
    }

    return (
      <div>
        <Dialog
          title={dialog.title}
          modal={false} /* Close at clicking the background */
          open={dialog.open}
          bodyClassName="dialog_body"
          titleClassName="dialog_title"
          autoScrollBodyContent
          contentStyle={customContentStyle}
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

LanternDialog.childContextTypes = { muiTheme: React.PropTypes.object }

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state,
  }
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(LanternDialog)
