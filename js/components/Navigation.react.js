/**
 *
 * Navigation.react.js
 * This component is the navigation left bar, contain code that link to all the pages.
 */


import React from 'react'
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

export default class LeftNavSimpleExample extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      open: false,
      signin: false,
    }
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
        that.setState({ signin: true })
      },
      'close': function closeMenu() {
        that.setState({ open: false })
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
    this.setState({ open: !this.state.open })
  }

  render() {
    return (
      <div>
        <FlatButton
          label="Lantern PRO"
          labelPosition="after"
          onTouchTap={this._handleToggle}>
          <FontIcon style={iconStyles} className="muidocs-icon-navigation-menu" />
        </FlatButton>
        <LeftNav open={this.state.open}>
          {MenuItems.map(this.addMenuItem)}
        </LeftNav>
        <Display if={this.state.signin}>
          <SignIn />
        </Display>
      </div>
    )
  }
}
