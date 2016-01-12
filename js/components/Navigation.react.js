/**
 *
 * Navigation.react.js
 * This component is the navigation left bar, contain code that link to all the pages.
 */

import { asyncOpenDialog, asyncOpenMenu } from '../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'
import LeftNav from 'material-ui/lib/left-nav'
import MenuItem from 'material-ui/lib/menus/menu-item'
import FlatButton from 'material-ui/lib/raised-button'
import FontIcon from 'material-ui/lib/font-icon'

import MenuItems from '../constants/MenuItems'

import Display from './Display.react'
import SignIn from './popups/SignIn.react'

const iconStyles = {
  marginRight: 24,
}

class MainNav extends React.Component {

  constructor(props) {
    super(props)
    this.addMenuItem = this.addMenuItem.bind(this)
    this._handleToggle = this._handleToggle.bind(this)
  }

  componentWillMount() {
    /* At the moment of mount elements declares the actions from 'js/constants/MenuItem' */
    const that = this
    this.actions = {
      'default': function defaultAction() {
      },
      'signin': function signIn() {
        that.props.dispatch(asyncOpenDialog(true))
      },
      'close': function closeMenu() {
        that.props.dispatch(asyncOpenMenu(false))
      },
    }
  }

  addMenuItem(item, i) {
    /* Render the MenuItems from 'js/constants/MenuItem' */
    return (
      <MenuItem key={i} onTouchTap={this.actions[item.action]}>{item.title}</MenuItem>
    )
  }
  _handleToggle() {
    const { openMenu } = this.props.data
    this.props.dispatch(asyncOpenMenu(!openMenu))
  }

  render() {
    const dispatch = this.props.dispatch
    const { openDialog, openMenu } = this.props.data
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
        <Display if={openDialog}>
          <SignIn />
        </Display>
      </div>
    )
  }
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
