/**
 * App.react.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import injectTapEventPlugin from 'react-tap-event-plugin'

import Navigation from './Navigation.react'
import LanternStatus from './LanternStatus.react'

/* Needed for onTouchTap
* Can go away when react 1.0 release
* Check this repo:
* https://github.com/zilverline/react-tap-event-plugin
*/
injectTapEventPlugin()

class App extends Component {
  componentDidMount() {
    const windowHeight = window.innerHeight
    const topSheet = document.getElementById('top_sheet')
    const middleSheet = document.getElementById('middle_sheet')
    const bottomSheet = document.getElementById('bottom_sheet')

    topSheet.style.height = `${windowHeight * 0.21}px`
    middleSheet.style.height = `${windowHeight * 0.5}px`
    bottomSheet.style.height = `${windowHeight * 0.29}px`

    console.log(windowHeight, { top: topSheet.style.height, middle: middleSheet.style.height, bottom: bottomSheet.style.height })
  }
  render() {
    return (
      <div className="wrapper">
        <div id="main_nav">
          <Navigation />
        </div>
        <LanternStatus />
        <section id="top_sheet">
          <img className="logo" src="/img/lantern_logo.svg" />
        </section>
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
