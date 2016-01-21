import React from 'react'
import RaisedButton from 'material-ui/lib/raised-button'
import StripeCheckout from 'react-stripe-checkout'

const STRIPE_PUB_KEY = 'pk_test_4MSPZvz9QtXGWEKdODmzV9ql'

class SelectPlan extends React.Component {
  render() {
    return (
      <div className="plan">
        {this.props.bestValue ?
          <div className="plans_bestvalue_badge">Best Value!</div>
          : null
        }
        <h3>{this.props.title}</h3>
        <span className="plans_price">${this.props.monthlyRate / 100}/mo</span>
        <p>for {this.props.months} month</p>
        <StripeCheckout
          label="Select"
          token={this.props.onToken}
          alipay
          panelLabel = "Pay {{amount}}"
          amount = {this.props.monthlyRate * this.props.months}
          image = "/img/logo.png"
          // showLoadingDialog
          stripeKey={STRIPE_PUB_KEY}>
          <div className="plans_input">
            {this.props.bestValue ?
              <RaisedButton label="Select" secondary />
              : <RaisedButton label="Select" primary />
              }
            </div>
          </StripeCheckout>
        </div>
    )
  }
}

SelectPlan.propTypes = {
  bestValue: React.PropTypes.string,
  title: React.PropTypes.string,
  monthlyRate: React.PropTypes.number,
  months: React.PropTypes.number,
  onToken: React.PropTypes.string,
}

export default SelectPlan
