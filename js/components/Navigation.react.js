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

import MenuItems from '../constants/MenuItems'

import LanternDialog from './dialogs/LanternDialog.react'

const iconStyles = {
  marginRight: 24,
}

class MainNav extends React.Component {

  constructor(props) {
    super(props)
    this.addMenuItem = this.addMenuItem.bind(this)
    this._handleToggle = this._handleToggle.bind(this)
    this._exit = this._exit.bind(this)
  }

  _exit() {
    this.props.dispatch(asyncOpenMenu(false))
  }

  addMenuItem(item, i) {
    /* * Render the MenuItems from 'js/constants/MenuItem' */
    let Item = null
    if (item.name === 'exit') {
      Item = <MenuItem key={i} onTouchTap={this._exit}>{item.title}</MenuItem>
    } else {
      Item = <MenuItem key={i} onTouchTap={() => { this.props.dispatch(asyncDialog({ open: true, name: item.name, title: item.title })) }}>{item.title}</MenuItem>
    }
    return Item
  }

  _handleToggle() {
    const { openMenu } = this.props.data
    this.props.dispatch(asyncOpenMenu(!openMenu))
  }

  render() {
    const { dialog, openMenu } = this.props.data
    return (
      <div>
        <FlatButton
          label="Lantern PRO"
          labelPosition="after"
          onTouchTap={this._handleToggle}>
          <FontIcon style={iconStyles} className="muidocs-icon-navigation-menu" />
        </FlatButton>
        <LeftNav open={openMenu}>
          {MenuItems.map(this.addMenuItem)}
        </LeftNav>
        <LanternDialog dialog={dialog} />
      </div>
    )
  }
}

MainNav.propTypes = {
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
export default connect(select)(MainNav)
