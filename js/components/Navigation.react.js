/**
 *
 * Navigation.react.js
 * This component is the navigation left bar, contain code that link to all the pages.
 */

import React from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next/lib'
import LeftNav from 'material-ui/lib/left-nav'
import MenuItem from 'material-ui/lib/menus/menu-item'
import FlatButton from 'material-ui/lib/raised-button'

import ThemeManager from 'material-ui/lib/styles/theme-manager'
import darkTheme from 'material-ui/lib/styles/raw-themes/dark-raw-theme'

import NavigationIcon from 'material-ui/lib/svg-icons/navigation/menu'
import IconInfo from 'material-ui/lib/svg-icons/action/info'
import IconShare from 'material-ui/lib/svg-icons/social/share'
import IconPhone from 'material-ui/lib/svg-icons/hardware/phone-android'
import IconCreditCard from 'material-ui/lib/svg-icons/action/credit-card'
import IconSettings from 'material-ui/lib/svg-icons/action/settings'
import IconTranslate from 'material-ui/lib/svg-icons/action/translate'
import IconFace from 'material-ui/lib/svg-icons/image/tag-faces'
import IconPerson from 'material-ui/lib/svg-icons/social/person'
import IconClose from 'material-ui/lib/svg-icons/navigation/close'

import { asyncDialog, asyncOpenMenu, asyncLanternStatus } from '../actions/AppActions'

import styles from '../constants/Styles'
import * as dialogs from '../constants/Dialogs'

import PlansDialog from './dialogs/Plans.react'
import WelcomeToProDialog from './dialogs/WelcomeToPro.react'
import MobileDialog from './dialogs/Mobile.react'
import LanguageDialog from './dialogs/Language.react'
import SignInDialog from './dialogs/SignIn.react'
import ShareDialog from './dialogs/Share.react'
import SettingsDialog from './dialogs/Settings.react'
import AboutDialog from './dialogs/About.react'

const menuItems = [
  {
    title: 'nav.lantern',
    name: 'lantern',
    icon: <NavigationIcon />,
    dialog: null,
  },
  {
    title: 'nav.plans',
    name: 'plans',
    icon: <IconCreditCard />,
    dialog: dialogs.PLANS_DIALOG,
  },
  {
    title: 'nav.signin',
    name: 'signin',
    icon: <IconPerson />,
    dialog: dialogs.SIGNIN_DIALOG,
  },
  {
    title: 'nav.mobile',
    name: 'mobile',
    icon: <IconPhone />,
    dialog: dialogs.MOBILE_DIALOG,
  },
  {
    title: 'nav.language',
    name: 'language',
    icon: <IconTranslate />,
    dialog: dialogs.LANGUAGE_DIALOG,
  },
  {
    title: 'nav.share',
    name: 'share',
    icon: <IconShare />,
    dialog: dialogs.SHARE_DIALOG,
  },
  {
    title: 'nav.settings',
    name: 'settings',
    icon: <IconSettings />,
    dialog: dialogs.SETTINGS_DIALOG,
  },
  {
    title: 'nav.about',
    name: 'about',
    icon: <IconInfo />,
    dialog: dialogs.ABOUT_DIALOG,
  },
  {
    title: 'nav.exit',
    name: 'exit',
    icon: <IconClose />,
    dialog: null,
  },
]


class MainNav extends React.Component {

  constructor(props) {
    super(props)
    this.addMenuItem = this.addMenuItem.bind(this)
    this.renderMenuItem = this.renderMenuItem.bind(this)
    this.getMenuItem = this.getMenuItem.bind(this)
    this.getMenuTitle = this.getMenuTitle.bind(this)
    this._handleToggle = this._handleToggle.bind(this)
    this._openDialog = this._openDialog.bind(this)
    this._disconnectLantern = this._disconnectLantern.bind(this)
  }

  getChildContext() {
    return { muiTheme: ThemeManager.getMuiTheme(darkTheme) }
  }

  getMenuItem(item, i, menuItemAction) {
    return (
      <MenuItem
        key={i}
        onTouchTap={menuItemAction}
        style={styles.menuItem}>
        {this.renderMenuItem(item)}
      </MenuItem>
    )
  }

  getMenuTitle(item, i) {
    const { Pro: isPro } = this.props.data
    return (
      <div key={i} className="menuTitle" onClick={this._handleToggle}>
        <div className="menuItem__icon">{item.icon}</div>
        <div className="menuItem__text"><span>{isPro ? 'Lantern PRO' : 'Lantern'}</span></div>
      </div>
    )
  }

  addMenuItem(item, i) {
    const menuItemAction = (item.name === 'exit') ? this._disconnectLantern : this._openDialog.bind(null, item)
    return (item.name !== 'lantern') ? this.getMenuItem(item, i, menuItemAction) : this.getMenuTitle(item, i)
  }

  _disconnectLantern() {
    const { lantern } = this.props.data
    const status = (lantern.status === 'off') ? 'on' : 'off'
    this.props.dispatch(asyncLanternStatus({status}))
  }

  _handleToggle() {
    const { openMenu } = this.props.data
    this.props.dispatch(asyncOpenMenu(!openMenu))
  }

  _openDialog(item) {
    this.props.dispatch(asyncDialog({
      open: true,
      name: item.name,
      title: item.title,
      dialog: item.dialog,
    }))
  }

  renderMenuItem(item) {
    return (
      <div className="menuItem">
        <div className="menuItem__icon">{item.icon}</div>
        <div className="menuItem__text"><span>{this.props.t(item.title)}</span></div>
      </div>
    )
  }

  renderDialog(dialog) {
    switch (dialog) {
    case dialogs.PLANS_DIALOG:
      return <PlansDialog icon={<IconCreditCard color="white" />} />
    case dialogs.WELCOME_TO_PRO_DIALOG:
      return <WelcomeToProDialog icon={<IconFace color="white" />} />
    case dialogs.SIGNIN_DIALOG:
      return <SignInDialog icon={<IconPerson color="white" />} />
    case dialogs.MOBILE_DIALOG:
      return <MobileDialog icon={<IconPhone color="white" />} />
    case dialogs.LANGUAGE_DIALOG:
      return <LanguageDialog icon={<IconTranslate color="white" />} />
    case dialogs.SETTINGS_DIALOG:
      return <SettingsDialog icon={<IconSettings color="white" />} />
    case dialogs.SHARE_DIALOG:
      return <ShareDialog icon={<IconShare color="white" />} />
    case dialogs.ABOUT_DIALOG:
      return <AboutDialog icon={<IconInfo color="white" />} />
    default:
      return null
    }
  }

  render() {
    const { dialog, openMenu, Pro: isPro } = this.props.data
    return (
      <div>
        <FlatButton
          label={ isPro ? 'Lantern PRO' : 'Lantern' }
          labelPosition="after"
          className="toggleMenuButton"
          style={styles.toggleMenuButton}
          labelStyle={styles.toggleMenuLabel}
          onTouchTap={this._handleToggle}
          >
            <NavigationIcon style={styles.toggleMenuIcon} />
        </FlatButton>
        <LeftNav
          open={openMenu}
          docked={false}
          overlayStyle={styles.overlayStyle}
          onRequestChange={this._handleToggle}
          >
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
  t: React.PropTypes.func,
}

MainNav.childContextTypes = { muiTheme: React.PropTypes.object }

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state.home,
  }
}


// Wrap the component to inject dispatch and state into it
export default translate(['translation'])(connect(select)(MainNav))
