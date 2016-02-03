import React from 'react'
import { connect } from 'react-redux'
import Dialog from 'material-ui/lib/dialog'
import ThemeManager from 'material-ui/lib/styles/theme-manager'
import LightTheme from 'material-ui/lib/styles/raw-themes/light-raw-theme'

import {noDialog} from '../../actions/AppActions'

import IconButton from 'material-ui/lib/icon-button'
import IconClose from 'material-ui/lib/svg-icons/navigation/close'

import styles from '../../constants/Styles'

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
    return (
      <div className="dialog__title">
        <div className="dialog__title__icon">{icon}</div>
        <div className="dialog__title__text"><span>{title}</span></div>
        <div className="dialog__title__close">
          <IconButton
            iconStyle={styles.dialogCloseButton}
            onTouchTap={this.handleClose}>
            <IconClose />
          </IconButton>
        </div>
      </div>
    )
  }

  render() {
    const { title, icon} = this.props
    return (<div>
      <Dialog
        modal={false} /* Close at clicking the background */
        open
        contentStyle={styles.modalContentStyle}
        title={this.renderTitle(title, icon)}
        bodyClassName="dialog_body"
        bodyStyle={styles.modalBodyStyle}
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
  dispatch: React.PropTypes.func,
  children: React.PropTypes.node,
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state.home,
  }
}

export default connect(select)(LanternDialog)
