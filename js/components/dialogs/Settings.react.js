import React from 'react'
import { connect } from 'react-redux'
import Checkbox from 'material-ui/lib/checkbox'
import Divider from 'material-ui/lib/divider'
import { asyncSaveSettings } from '../../actions/BackendActions'
import IllustratedDialog from './IllustratedDialog.react'

class Settings extends React.Component {
  constructor(props) {
    super(props)
    this.saveSettings = this.saveSettings.bind(this)
  }

  saveSettings(input) {
    const { settings: settings } = this.props.data
    settings[input.target.name] = input.target.checked
    this.props.dispatch(asyncSaveSettings(settings))
  }

  render() {
    const { settings: settings } = this.props.data
    return (
      <IllustratedDialog
        title="Settings Options"
        icon={this.props.icon}
        illustration="settings.svg">
        <div id="settings_body">
          <div className="settings_option">
            <Checkbox
              name="autoLaunch"
              labelPosition="left"
              defaultChecked={settings.autoLaunch}
              onCheck={this.saveSettings}
              label="Run Lantern on System Start"/>
          </div>
          <Divider />
          <div className="settings_option">
            <Checkbox
              name="proxyAll"
              labelPosition="left"
              defaultChecked={settings.proxyAll}
              onCheck={this.saveSettings}
              label="Proxy all traffic"/>
          </div>
          <Divider />
          <div className="settings_option">
            <Checkbox
              name="autoReport"
              labelPosition="left"
              defaultChecked={settings.autoReport}
              onCheck={this.saveSettings}
              label="Securelly report usage statistics to contribute to Lantern"/>
          </div>
        </div>
      </IllustratedDialog>
    )
  }
}

Settings.propTypes = {
  data: React.PropTypes.object,
  dispatch: React.PropTypes.func,
  icon: React.PropTypes.object,
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state.backend,
  }
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(Settings)
