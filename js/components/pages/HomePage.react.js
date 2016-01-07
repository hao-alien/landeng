/*
 * HomePage
 * This is the first thing users see of our App
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import RaisedButton from 'material-ui/lib/raised-button'

import ReferralCode from '../ReferralCode.react'

class HomePage extends Component {
  render() {
    return (
      <div>
        <h2>Get Free Months</h2>
        <h2>Invite friends and you will both get a free month of Lanter PRO when they sign up!</h2>
        <ReferralCode />
        <RaisedButton label="Email Invite" />
        <RaisedButton label="Share On Social" />
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
