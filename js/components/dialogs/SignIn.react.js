import { asyncDialog } from '../../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'

class SignIn extends React.Component {
  constructor(props) {
    super(props)
    this._handleClose = this._handleClose.bind(this)
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
        Montly Plan
        Anual Plan
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
