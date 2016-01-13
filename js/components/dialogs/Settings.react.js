import { asyncDialog, asyncSettings } from '../../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'
import Checkbox from 'material-ui/lib/checkbox'
import Divider from 'material-ui/lib/divider'


class Settings extends React.Component {
  constructor(props) {
    super(props)
    this._handleClose = this._handleClose.bind(this)
    this.saveSettings = this.saveSettings.bind(this)
  }

  _handleClose() {
    this.props.dispatch(asyncDialog({ open: false, name: '', title: '' }))
  }

  saveSettings(input) {
    const { settings } = this.props.data
    settings[input.target.name] = input.target.checked
    this.props.dispatch(asyncSettings(settings))
  }

  render() {
    const { settings } = this.props.data
    return (
      <div>
        <div id="settings_header">
        </div>
        <div id="settings_body">
          <div className="settings_option">
            <Checkbox
              name="systemStart"
              labelPosition="left"
              defaultChecked={settings.systemStart}
              onCheck={this.saveSettings}
              label="Run Lantern on System Start"/>
          </div>
          <Divider />
          <div className="settings_option">
            <Checkbox
              name="proxyTraffic"
              labelPosition="left"
              defaultChecked={settings.proxyTraffic}
              onCheck={this.saveSettings}
              label="Proxy all traffic"/>
          </div>
          <Divider />
          <div className="settings_option">
            <Checkbox
              name="sendStatistics"
              labelPosition="left"
              defaultChecked={settings.sendStatistics}
              onCheck={this.saveSettings}
              label="Securelly report usage statistics to contribute to Lantern"/>
          </div>
        </div>
      </div>
    )
  }
}

Settings.propTypes = {
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
export default connect(select)(Settings)
