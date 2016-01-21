import React from 'react'
import { connect } from 'react-redux'
import Dialog from 'material-ui/lib/dialog'
import ThemeManager from 'material-ui/lib/styles/theme-manager'
import LightTheme from 'material-ui/lib/styles/raw-themes/light-raw-theme'

import IconButton from 'material-ui/lib/icon-button'
import IconClose from 'material-ui/lib/svg-icons/navigation/close'

import {noDialog} from '../../actions/AppActions'

const modalContentStyle = { width: '650px' }
const modalBodyStyle = { minHeight: '420px' }

class LanternDialog extends React.Component {
  constructor(props) {
    super(props)
    this.handleClose = this._handleClose.bind(this)
  }

  getChildContext() {
    return { muiTheme: ThemeManager.getMuiTheme(LightTheme) }
  }

  _handleClose() {
    this.props.dispatch(noDialog())
  }

  renderTitle(title, icon) {
    return (<div className="dialog_title">
      {icon}
      <span>{title}</span>
      <IconButton iconStyle={{
        marginRight: -16,
        marginLeft: 'auto'}}
        onTouchTap={this.handleClose}>
        <IconClose />
      </IconButton>
    </div>)
  }

  render() {
    let {open, title, icon} = this.props
    return (<div>
      <Dialog
        modal={false} /* Close at clicking the background */
        open={true}
        contentStyle={modalContentStyle}
        title={this.renderTitle(title, icon)}
        bodyClassName="dialog_body"
        bodyStyle={modalBodyStyle}
        onRequestClose={this.handleClose}>
        {this.props.children}
      </Dialog>
    </div>)
  }
}

LanternDialog.childContextTypes = { muiTheme: React.PropTypes.object }

LanternDialog.propTypes = {
  title: React.PropTypes.string,
  icon: React.PropTypes.object,
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state.homeReducer,
  }
}

export default connect(select)(LanternDialog)
