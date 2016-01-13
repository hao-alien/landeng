import { asyncDialog } from '../../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'
import TextField from 'material-ui/lib/text-field'
import RaisedButton from 'material-ui/lib/raised-button'
import IconEmail from 'material-ui/lib/svg-icons/communication/email'

import CreditCard from '../../inputs/CreditCard'


const iconStyles = {
  marginRight: 10,
}

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
    this._handleClose = this._handleClose.bind(this)
    this._emailValidation = this._emailValidation.bind(this)
    this.lanternCheckout = this.lanternCheckout.bind(this)
  }

  _handleClose() {
    this.props.dispatch(asyncDialog({ open: false, name: '', title: '' }))
  }

  _emailValidation() {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (re.test( this.refs.email.getValue() )) {
      this.setState({ errorEmail: '' })
    } else {
      this.setState({ errorEmail: 'Write a valid email address' })
    }
  }
  _emailValidation() {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (re.test( this.refs.email.getValue() )) {
      this.setState({ errorEmail: '' })
    } else {
      this.setState({ errorEmail: 'Write a valid email address' })
    }
  }
  lanternCheckout() {
    // ...
  }

  render() {
    return (
      <div>
        <IconEmail style={iconStyles} />
        <TextField
          hintText="Enter your email address"
          floatingLabelText="Email"
          errorText={this.state.errorEmail}
          onBlur={this._emailValidation}
          ref="email" />
        <CreditCard />
        <TextField
          hintText="Enter the expiration month of your credit card"
          floatingLabelText="MM/YYYY"
          errorText={this.state.errorExpirationDate}
          ref="expirationDate" />
        <TextField
          hintText="Enter the Card Verification Value (CVV) of your credit card"
          floatingLabelText="CVV"
          errorText={this.state.errorCVV}
          type="password"
          ref="cardVerificationValue" />
        <TextField
          hintText="Referral Code"
          floatingLabelText="Referral Code"
          errorText={this.state.referralCode}
          ref="referralCode" />
        <div>
          <b>Total:</b><span>${this.state.totalCheckout}</span>
        </div>
        <RaisedButton label="Checkout" onTouchTap={this.lanternCheckout} />
      </div>
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
