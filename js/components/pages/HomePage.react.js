import React, { Component } from 'react'
import { connect } from 'react-redux'

import ScreenFree from './ScreenFree.react'
import ScreenPro from './ScreenPro.react'

class HomePage extends Component {
  render() {
    const { Pro: isPro } = this.props.data
    // return <div>{ isPro ? <ScreenPro /> : <ScreenFree /> }</div>
    return <div>{ isPro ? <ScreenFree /> : <ScreenPro /> }</div>
  }
}

HomePage.propTypes = {
  data: React.PropTypes.object,
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state.pro,
  }
}


export default connect(select)(HomePage)
