/**
 *
 * Navigation.react.js
 * This component is the navigation left bar, contain code that link to all the pages.
 */

import { asyncDialog, asyncOpenMenu } from '../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'
import LeftNav from 'material-ui/lib/left-nav'
import MenuItem from 'material-ui/lib/menus/menu-item'
import FlatButton from 'material-ui/lib/raised-button'
import FontIcon from 'material-ui/lib/font-icon'
import ThemeManager from 'material-ui/lib/styles/theme-manager'
import darkTheme from 'material-ui/lib/styles/raw-themes/dark-raw-theme'

import PlansDialog from './dialogs/Plans.react'
import WelcomeToProDialog from './dialogs/WelcomeToPro.react'
import MobileDialog from './dialogs/Mobile.react'
import LanguageDialog from './dialogs/Language.react'
import ShareDialog from './dialogs/Share.react'
import SettingsDialog from './dialogs/Settings.react'
import AboutDialog from './dialogs/About.react'


import styles from '../constants/styles'
import * as dialogs from '../constants/Dialogs'

const menuItems = [
  {
    title: 'Lantern PRO Plans',
    name: 'plans',
    dialog: dialogs.PLANS_DIALOG,
  },
  {
    title: 'Lantern PRO Sign in',
    name: 'signin',
    dialog: dialogs.SIGNIN_DIALOG,
  },
  {
    title: 'Get Mobile Version',
    name: 'mobile',
    dialog: dialogs.MOBILE_DIALOG,
  },
  {
    title: 'Language',
    name: 'language',
    dialog: dialogs.LANGUAGE_DIALOG,
  },
  {
    title: 'Share',
    name: 'share',
    dialog: dialogs.SHARE_DIALOG,
  },
  {
    title: 'Settings',
    name: 'settings',
    dialog: dialogs.SETTINGS_DIALOG,
  },
  {
    title: 'About',
    name: 'about',
    dialog: dialogs.ABOUT_DIALOG,
  },
  {
    title: 'Exit',
    name: 'exit',
  },
]


class MainNav extends React.Component {

  constructor(props) {
    super(props)
    this.addMenuItem = this.addMenuItem.bind(this)
    this._handleToggle = this._handleToggle.bind(this)
    this._exit = this._exit.bind(this)
  }

  getChildContext() {
    return { muiTheme: ThemeManager.getMuiTheme(darkTheme) }
  }

  _exit() {
    this.props.dispatch(asyncOpenMenu(false))
  }

  addMenuItem(item, i) {
    /* * Render the MenuItems from 'js/constants/MenuItem' */
    let Item = null
    if (item.name === 'exit') {
      Item = (
        <MenuItem key={i} onTouchTap={this._exit}>
          {item.title}
        </MenuItem>
      )
    } else {
      Item = (
        <MenuItem key={i} onTouchTap={ () => {
          this.props.dispatch(asyncDialog({
            open: true,
            name: item.name,
            title: item.title,
            dialog: item.dialog,
          }))
        }}>
          {item.title}
        </MenuItem>
      )
    }
    return Item
  }

  _handleToggle() {
    const { openMenu } = this.props.data
    this.props.dispatch(asyncOpenMenu(!openMenu))
  }

  renderDialog(dialog) {
    switch (dialog) {
    case dialogs.PLANS_DIALOG:
      return <PlansDialog />
    case dialogs.WELCOME_TO_PRO_DIALOG:
      return <WelcomeToProDialog />
    case dialogs.SIGNIN_DIALOG:
      return null
    case dialogs.MOBILE_DIALOG:
      return <MobileDialog />
    case dialogs.LANGUAGE_DIALOG:
      return <LanguageDialog />
    case dialogs.SETTINGS_DIALOG:
      return <SettingsDialog />
    case dialogs.SHARE_DIALOG:
      return <ShareDialog />
    case dialogs.ABOUT_DIALOG:
      return <AboutDialog />
    default:
      return null
    }
  }

  render() {
    const { dialog, openMenu } = this.props.data
    return (
      <div>
        <FlatButton
          label="Lantern PRO"
          labelPosition="after"
          onTouchTap={this._handleToggle}>
          <FontIcon style={styles.iconStyles} className="muidocs-icon-navigation-menu" />
        </FlatButton>
        <LeftNav open={openMenu}>
          {menuItems.map(this.addMenuItem)}
        </LeftNav>
        {this.renderDialog(dialog.dialog)}
      </div>
    )
  }
}


MainNav.propTypes = {
  data: React.PropTypes.object,
  dispatch: React.PropTypes.func,
}

MainNav.childContextTypes = { muiTheme: React.PropTypes.object }

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state.homeReducer,
  }
}


// Wrap the component to inject dispatch and state into it
export default connect(select)(MainNav)
