/**
 *
 * App.react.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import injectTapEventPlugin from 'react-tap-event-plugin'
import Logo from '../../img/logo.png'

import Navigation from './Navigation.react'

/* Needed for onTouchTap
* Can go away when react 1.0 release
* Check this repo:
* https://github.com/zilverline/react-tap-event-plugin
*/
injectTapEventPlugin()

class App extends Component {
  render() {
    return (
      <div className="wrapper">
        <Navigation />
        <img className="logo" src={Logo} />
        { this.props.children }
      </div>
    )
  }
}

App.propTypes = {
  children: React.PropTypes.element,
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state,
  }
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(App)
