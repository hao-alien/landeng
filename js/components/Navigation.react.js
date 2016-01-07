/**
 *
 * Navigation.react.js
 * This component is the navigation left bar, contain code that link to all the pages.
 */


import React from 'react'
import LeftNav from 'material-ui/lib/left-nav'
import MenuItem from 'material-ui/lib/menus/menu-item'
import RaisedButton from 'material-ui/lib/raised-button'

import MenuItems from '../constants/MenuItems'

export default class LeftNavSimpleExample extends React.Component {

  constructor(props) {
    super(props)
    this.state = { open: false }
    this.addMenuItem = this.addMenuItem.bind(this)
    this._handleToggle = this._handleToggle.bind(this)
  }

  componentWillMount() {
    const that = this
    this.actions = {
      'default': function defaultAction() {
      },
      'close': function closeMenu() {
        that.setState({ open: false })
      },
    }
  }

  addMenuItem(item, i) {
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
        <RaisedButton
          label="Open Menu"
          onTouchTap={this._handleToggle} />
        <LeftNav open={this.state.open}>
          {MenuItems.map(this.addMenuItem)}
        </LeftNav>
      </div>
    )
  }
}
