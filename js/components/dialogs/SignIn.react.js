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
        Faster Connection Speed
        Smarter Servers
        Stronger Blocking Resistance
        <div>
          <h3>Montly Plan</h3>
          <RaisedButton label="Select" primary onTouchTap={this.montlyPlan} />
        </div>
        <div>
          <h3>Anual Plan</h3>
          <RaisedButton label="Select" secondary />
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
