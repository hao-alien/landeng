import React from 'react'
import { connect } from 'react-redux'

import { asyncLanternStatus } from '../actions/AppActions'

class LanternStatus extends React.Component {
  constructor(props) {
    super(props)
    this.changeLanternStatus = this.changeLanternStatus.bind(this)
  }

  /** This method is only to check the Component connection status */
  /** Please delete before the implementation */
  changeLanternStatus(state) {
    const status = (state === 'off') ? 'on' : 'off'
    this.props.dispatch(asyncLanternStatus({status}))
  }

  render() {
    const { lantern } = this.props.data
    return (
      /** Remove the onClick before the connection status implemementation */
      <div id="lantern__status" className={this.props[lantern.status].className} onClick={this.changeLanternStatus.bind(null, lantern.status)}>
        <p>{this.props[lantern.status].lanternStatusMessage}</p>
        <span className="circle__indicator"></span>
      </div>
    )
  }
}

LanternStatus.propTypes = {
  status: React.PropTypes.string,
  data: React.PropTypes.object,
  dispatch: React.PropTypes.func,
}

LanternStatus.defaultProps = {
  on: {
    lanternStatusMessage: 'Lantern is ON. You can access your blocked sites.',
    className: 'lantern__status--on',
  },
  off: {
    lanternStatusMessage: 'Lantern is OFF. You can\'t access your blocked sites.',
    className: 'lantern__status--off',
  },
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state.home,
  }
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(LanternStatus)
