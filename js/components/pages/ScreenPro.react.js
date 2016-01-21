/*
 * Home Screen for Free Users
 * This is the first thing users see of our App
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import RaisedButton from 'material-ui/lib/raised-button'

import TimeLeftPro from '../TimeLeftPro.react'

class ScreenPro extends Component {
  constructor(props) {
    super(props)
    this.state = {
      errorMail: '',
    }
    this._emailValidation = this._emailValidation.bind(this)
    this.getCode = this.getCode.bind(this)
  }

  getCode() {

  }

  _emailValidation() {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (re.test( this.refs.email.getValue() )) {
      this.setState({ errorMail: '' })
    } else {
      this.setState({ errorMail: 'Write a valid email address' })
    }
  }


  render() {
    const { user } = this.props.data
    return (
      <div>
        <section id="middle_sheet">
          <h2>Get Free Months</h2>
          <p>Invite friends and you will both get a free month of Lantern Pro when they Sing up!</p>
          <div id="invite_pro">
            <span><RaisedButton label="Email Invite" /></span>
            <span><RaisedButton label="Share on social" /></span>
          </div>
        </section>
        <section id="bottom_sheet">
          <TimeLeftPro deadline={user.deadline} />
        </section>
      </div>
    )
  }
}

ScreenPro.propTypes = {
  dispatch: React.PropTypes.func,
  data: React.PropTypes.object,
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state.homeReducer,
  }
}


// Wrap the component to inject dispatch and state into it
export default connect(select)(ScreenPro)
