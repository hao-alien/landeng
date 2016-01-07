/**
 *
 * Navigation.react.js
 *
 * This component is the navigation left bar, contain code that link to all the pages.
 */


import React from 'react'
import LeftNav from 'material-ui/lib/left-nav'
import MenuItem from 'material-ui/lib/menus/menu-item'
import RaisedButton from 'material-ui/lib/raised-button'

export default class LeftNavSimpleExample extends React.Component {

  constructor(props) {
    super(props)
    this.state = { open: false }
    this._handleToggle = this._handleToggle.bind(this)
  }

  _handleToggle() {
    this.setState({open: !this.state.open})
  }

  render() {
    return (
      <div>
        <RaisedButton
          label="Open Menu"
          onTouchTap={this._handleToggle} />
        <LeftNav open={this.state.open}>
          <MenuItem>Menu Item</MenuItem>
          <MenuItem>Menu Item 2</MenuItem>
        </LeftNav>
      </div>
    )
  }
}
