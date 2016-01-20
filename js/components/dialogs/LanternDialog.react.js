import { asyncDialog } from '../../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'
import Dialog from 'material-ui/lib/dialog'
import ThemeManager from 'material-ui/lib/styles/theme-manager'
import LightTheme from 'material-ui/lib/styles/raw-themes/light-raw-theme'

import IconButton from 'material-ui/lib/icon-button'
import IconClose from 'material-ui/lib/svg-icons/navigation/close'
import IconCreditCard from 'material-ui/lib/svg-icons/action/credit-card'
import IconTranslate from 'material-ui/lib/svg-icons/action/translate'
import IconInfo from 'material-ui/lib/svg-icons/action/info'
import IconSettings from 'material-ui/lib/svg-icons/action/settings'
import IconShare from 'material-ui/lib/svg-icons/social/share'
import IconPhone from 'material-ui/lib/svg-icons/hardware/phone-android'

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

  renderTitle(title, icon) {
    return (<div className="dialog_title">
      {icon}
      <span>{title}</span>
      <IconButton iconStyle={{
        marginRight: -16,
        marginLeft: 'auto'}}
        onClick={this._handleClose}>
        <IconClose />
      </IconButton>
    </div>)
  }

  render() {
    const { dialog } = this.props.data
    const components = {
      'plans': {icon: <IconCreditCard color="white" />, children: <Plans />},
      //'signin': <StripeCheckout />,
      //'checkout': <StripeCheckout />,
      'language': {icon: <IconTranslate color="white" />, children: <Language />},
      'mobile': {icon: <IconPhone color="white" />, children: <Mobile />},
      'settings': {icon: <IconSettings color="white" />, children: <Settings />},
    }

    if (!dialog.open || !components[dialog.name]) {
      return null;
    }
    return (
      <div>
        <Dialog
          modal={false} /* Close at clicking the background */
          open={dialog.open}
          contentStyle={styles.modalContentStyle}
          title={this.renderTitle(dialog.title, components[dialog.name].icon)}
          bodyClassName="dialog_body"
          bodyStyle={styles.modalBodyStyle}
          onRequestClose={this._handleClose}>
          {components[dialog.name].children}
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
    data: state.homeReducer,
  }
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(LanternDialog)
