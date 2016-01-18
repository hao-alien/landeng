import React from 'react'
import { connect } from 'react-redux'
import Plans from '../../constants/Plans'
import SelectPlan from '../../Inputs/SelectPlan'
import {asyncPurchase} from '../../actions/ProAPIActions'


class SignIn extends React.Component {
  onToken (token) {
    this.props.dispatch(asyncPurchase(token))
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
          {Plans.map((plan) => {
            return <SelectPlan key={Symbol.keyFor(plan.id)}
              bestValue={plan.bestValue}
              title={plan.title}
              monthlyRate = {plan.monthlyRate}
              months = {plan.months}
              onToken={this.onToken.bind(this, plan.id)} />
            })}
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
