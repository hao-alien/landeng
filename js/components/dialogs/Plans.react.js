import React from 'react'
import { connect } from 'react-redux'
import IconCreditCard from 'material-ui/lib/svg-icons/action/credit-card'
import assignToEmpty from '../../utils/assign'
import Plans from '../../constants/Plans'
import SelectPlan from '../../Inputs/SelectPlan'
import {asyncPurchase} from '../../actions/ProAPIActions'
import LanternDialog from './Dialog.react'

class PlansDialog extends React.Component {
  onToken(plan, token) {
    this.props.dispatch(asyncPurchase(assignToEmpty(token, {plan: plan})))
  }

  renderError(error) {
    return this.renderPlans()
  }

  renderPlans() {
    return (
      <LanternDialog title="Lantern PRO Plans"
        icon = {<IconCreditCard color="white" />}>
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
        </LanternDialog>
    )
  }


  render() {
    let data = this.props.data
    if (data.showError) {
      return this.renderError(data.error)
    } else {
      return this.renderPlans()
    }
  }
}

PlansDialog.propTypes = {
  data: React.PropTypes.object,
  dispatch: React.PropTypes.func,
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state.purchaseReducer,
  }
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(PlansDialog)
