import React, { Component } from 'react'
import TextField from 'material-ui/lib/text-field'
import IconCreditCard from 'material-ui/lib/svg-icons/action/credit-card'

import cards from './CardTypes'

import styles from '../constants/Styles'

const iconColors = {
  'mastercard': 'red',
  'visa': 'yellow',
  'amex': 'green',
  'other': 'blue',
  'default': 'black',
}


class CreditCard extends Component {
  constructor(props, context) {
    super(props, context)

    const state = {
      cardNumber: '',
      cardType: '',
      iconColor: 'black',
    }

    this.state = state
  }

  setCardNumber(event) {
    const targetVal = event.target.value
    this.setState({cardNumber: targetVal})
  }

  cardFromNumber(num) {
    const numAux = (num + '').replace(/D/g, '')
    for (let i = 0; i < cards.length; i++) {
      const n = cards[i]
      if (n.pattern.test(numAux)) return n
    }
  }

  handleCCNumberInput(event) {
    const target = event.currentTarget
    const targetVal = target.value
    const charCode = String.fromCharCode(event.which)
    const charCodeLen = (targetVal.replace(/\D/g, '') + charCode).length

    const card = this.cardFromNumber(targetVal + charCode)
    let maxLength = 16

    if (this.state.cardNumber.length >= 2) {
      let iconColor
      if ( card !== undefined ) {
        iconColor = ( iconColors[card.type] === undefined ) ? iconColors.other : iconColors[card.type]
        this.setState({ cardType: card.type, iconColor })
      }
    }

    if ( card ) {
      maxLength = card.length
      if ( !/^\d+$/.test(charCode) || charCodeLen > maxLength ) {
        return void event.preventDefault()
      }
    }

    const cardTest = card && card.type === 'amex' ? /^(\d{4}|\d{4}\s\d{6})$/ : /(?:^|\s)(\d{4})$/

    return cardTest.test(targetVal) && target.selectionStart === targetVal.length ?
        (event.preventDefault(), void(target.value = targetVal + ' ' + charCode)) : void 0
  }

  render() {
    return (
      <div>
        <div className="input_inline_icon">
          <IconCreditCard style={{marginRight: 10}} color={this.state.iconColor} />
        </div>
        <div className="input_inline_text">
          <TextField
            autoComplete="off"
            floatingLabelText="Credit Card Number"
            style={styles.textInputInline}
            onChange={(e)=> this.setCardNumber(e)}
            onKeyPress={(e)=> this.handleCCNumberInput(e)}
          />
        </div>
      </div>
    )
  }
}

export default CreditCard
