/*
 * Home Screen for Free Users
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next/lib';
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
    const { t } = this.props
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (re.test( this.refs.email.getValue() )) {
      this.setState({ errorMail: '' })
    } else {
      this.setState({ errorMail: t('Write a valid email address') })
    }
  }


  render() {
    const { user } = this.props.data
    const { t } = this.props
    return (
      <div>
        <section id="middle_sheet">
          <h2>{t('Get Free Months')}</h2>
          <p>{t('Invite friends and you will both get a free month of Lantern Pro when they Sing up!')}</p>
          <div id="referral_code">
            <p>{t('Your referral code')}</p>
            <span>133742</span>
          </div>
          <div id="invite_pro">
            <span><RaisedButton label={t('Email Invite')} /></span>
            <span><RaisedButton label={t('Share on social')} /></span>
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
  t: React.PropTypes.func,
  dispatch: React.PropTypes.func,
  data: React.PropTypes.object,
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state.home,
  }
}


// Wrap the component to inject dispatch and state into it
export default translate(['translation'])(connect(select)(ScreenPro))
