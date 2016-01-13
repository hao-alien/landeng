/*
 * HomePage
 * This is the first thing users see of our App
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'

import ScreenFree from './ScreenFree.react'

class HomePage extends Component {
  render() {
    return (
      <div>
        <ScreenFree />
      </div>
    )
  }
}

HomePage.propTypes = {
  dispatch: React.PropTypes.func,
  data: React.PropTypes.object,
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state,
  }
}


// Wrap the component to inject dispatch and state into it
export default connect(select)(HomePage)
