/*
 * HomePage
 * This is the first thing users see of our App
 */

import { asyncChangeProjectName } from '../../actions/AppActions'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

class HomePage extends Component {
  render() {
    const dispatch = this.props.dispatch
    const { projectName } = this.props.data
    return (
      <div>
        <h1>Hello World!</h1>
        <h2>This is a test of Redux <span className="home__text--red">{ projectName }</span></h2>
        <label className="home__label">Change to your project name:
          <input className="home__input" type="text" onChange={(evt) => { dispatch(asyncChangeProjectName(evt.target.value)) }} defaultValue="GetLantern" value={projectName} />
        </label>
        <Link className="btn" to="/readme">ReadMe</Link>
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
