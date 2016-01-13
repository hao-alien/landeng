import { asyncDialog } from '../../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'
import StripeCheckout from 'react-stripe-checkout'
import pro from 'lantern-pro-js-client'

import TextField from 'material-ui/lib/text-field'
import RaisedButton from 'material-ui/lib/raised-button'
import IconEmail from 'material-ui/lib/svg-icons/communication/email'

import CreditCard from '../../inputs/CreditCard'

import inputCheckoutStyle from '../../constants/componentStyles'


const iconStyles = {
  marginRight: 10,
}

const STRIPE_PUB_KEY = 'pk_test_4MSPZvz9QtXGWEKdODmzV9ql'


class Checkout extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      errorEmail: '',
      errorCreditCard: '',
      errorExpirationDate: '',
      errorCVV: '',
      totalCheckout: 9.97,
    }
    /*this._handleClose = this._handleClose.bind(this)
    this._emailValidation = this._emailValidation.bind(this)*/
    this.lanternCheckout = this.lanternCheckout.bind(this)
  }

  onToken (token) {
    this.props.dispatch(asyncPurchase(token))
  }


  lanternCheckout() {
    // ...
  }

  render() {
    return (
      <StripeCheckout
        token={this.onToken}
        alipay = {true}
        panelLabel = 'Pay {{amount}}'
        amount = {20}
        image = '/img/logo.png'
        stripeKey={STRIPE_PUB_KEY} />
    )
  }
}

Checkout.propTypes = {
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
export default connect(select)(Checkout)
