/*
 * HomePage
 * This is the first thing users see of our App
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'

import Display from '../Display.react'
import ScreenFree from './ScreenFree.react'
import ScreenPro from './ScreenPro.react'

class HomePage extends Component {
  render() {
    const { user } = this.props.data
    return (
      <div>
        <Display display={user.pro}>
          <ScreenPro />
        </Display>
        <Display display={!user.pro}>
          <ScreenFree />
        </Display>
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
