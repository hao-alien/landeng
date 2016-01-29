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
    this.getCode = this.getCode.bind(this)
  }

  getCode() {

  }

  render() {
    const { user } = this.props.data
    const { t } = this.props
    return (
      <div>
        <section id="middle_sheet">
          <h2>{t('pro.get_months_headline')}</h2>
          <p>{t('pro.get_months_p')}</p>
          <div id="referral_code">
            <p>{t('pro.referral_code')}</p>
            <span>133742</span>
          </div>
          <div id="invite_pro">
            <span><RaisedButton label={t('pro.invite')} /></span>
            <span><RaisedButton label={t('pro.share')} /></span>
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
