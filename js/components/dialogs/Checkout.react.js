import { asyncDialog } from '../../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'
import TextField from 'material-ui/lib/text-field'
import RaisedButton from 'material-ui/lib/raised-button'
import IconEmail from 'material-ui/lib/svg-icons/communication/email'

import CreditCard from '../../inputs/CreditCard'

import inputCheckoutStyle from '../../constants/componentStyles'


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
        <div className="input_inline">
          <div className="input_inline_icon">
            <IconEmail style={iconStyles} />
          </div>
          <div className="input_inline_text">
            <TextField
              hintText="Enter your email address"
              floatingLabelText="Email"
              style={inputCheckoutStyle}
              errorText={this.state.errorEmail}
              onBlur={this._emailValidation}
              ref="email" />
          </div>
        </div>
        <div className="input_inline">
          <CreditCard />
        </div>
        <div className="input_inline">
          <div className="input_inline_icon">
            <IconEmail style={iconStyles} />
          </div>
          <div className="input_inline_text">
            <TextField
              hintText="Enter the expiration month of your credit card"
              floatingLabelText="MM/YYYY"
              style={inputCheckoutStyle}
              errorText={this.state.errorExpirationDate}
              ref="expirationDate" />
          </div>
        </div>
        <div className="input_inline">
          <div className="input_inline_icon">
            <IconEmail style={iconStyles} />
          </div>
          <div className="input_inline_text">
            <TextField
              hintText="Enter the Card Verification Value (CVV) of your credit card"
              floatingLabelText="CVV"
              style={inputCheckoutStyle}
              errorText={this.state.errorCVV}
              type="password"
              ref="cardVerificationValue" />
          </div>
        </div>
        <div id="checkout_referral_code">
          <div className="input_inline">
            <div className="input_inline_icon">
              <IconEmail style={iconStyles} />
            </div>
            <div className="input_inline_text">
              <TextField
                hintText="Referral Code"
                floatingLabelText="Referral Code"
                style={inputCheckoutStyle}
                errorText={this.state.referralCode}
                ref="referralCode" />
            </div>
          </div>
          <div id="checkout_total">
            <b>Total:</b><span>${this.state.totalCheckout}</span>
          </div>
          <div id="checkout_submit">
            <RaisedButton label="Checkout" onTouchTap={this.lanternCheckout} />
          </div>
        </div>
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
