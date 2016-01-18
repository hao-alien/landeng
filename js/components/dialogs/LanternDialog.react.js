import { asyncDialog } from '../../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'
import Dialog from 'material-ui/lib/dialog'
import ThemeManager from 'material-ui/lib/styles/theme-manager'
import LightTheme from 'material-ui/lib/styles/raw-themes/light-raw-theme'

import IconButton from 'material-ui/lib/icon-button'
import NavigationClose from 'material-ui/lib/svg-icons/navigation/close'

import Language from './Language.react'
import Mobile from './Mobile.react'
import Settings from './Settings.react'
import Plans from './Plans.react'

import styles from '../../constants/styles'

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
      'plans': <Plans />,
      //'signin': <StripeCheckout />,
      //'checkout': <StripeCheckout />,
      'language': <Language />,
      'mobile': <Mobile />,
      'settings': <Settings />,
    }

    return (
      <div>
        <Dialog
          modal={false} /* Close at clicking the background */
          open={dialog.open}
          contentStyle={styles.modalContentStyle}
          title={dialog.title}
          titleClassName="dialog_title"
          bodyClassName="dialog_body"
          bodyStyle={styles.modalBodyStyle}
          iconElementRight={<IconButton><NavigationClose /></IconButton>}
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
