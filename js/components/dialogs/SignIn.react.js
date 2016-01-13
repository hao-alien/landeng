import { asyncDialog } from '../../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'
import RaisedButton from 'material-ui/lib/raised-button'

class SignIn extends React.Component {
  constructor(props) {
    super(props)
    this._handleClose = this._handleClose.bind(this)
    this.montlyPlan = this.montlyPlan.bind(this)
  }

  montlyPlan() {
    this.props.dispatch(asyncDialog({ open: true, name: 'checkout', title: 'Lantern PRO Checkout' }))
  }

  _handleClose() {
    this.props.dispatch(asyncDialog({ open: false, name: '', title: '' }))
  }

  render() {
    return (
      <div>
        <div id="plans_header">
          <div id="plans_header_icon"></div>
          <div id="plans_header_info">
            <ul>
              <li>Faster Connection Speed</li>
              <li>Smarter Servers</li>
              <li>Stronger Blocking Resistance</li>
            </ul>
          </div>
        </div>
        <div id="plans_select">
          <div className="plan">
            <h3>Montly Plan</h3>
            <span className="plans_price">$7.99/mo</span>
            <p>for 1 month</p>
            <div className="plans_input">
              <RaisedButton label="Select" primary onTouchTap={this.montlyPlan} />
            </div>
          </div>
          <div className="plan">
            <div className="plans_bestvalue_badge">Best Value!</div>
            <h3>Anual Plan</h3>
            <span className="plans_price">$4.99/mo</span>
            <p>for 12 month</p>
            <div className="plans_input">
              <RaisedButton label="Select" secondary onTouchTap={this.montlyPlan} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

SignIn.propTypes = {
  data: React.PropTypes.object,
  dispatch: React.PropTypes.func,
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state,
  }
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(SignIn)
