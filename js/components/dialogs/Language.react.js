import { asyncDialog, asyncSetLanguage } from '../../actions/AppActions'

import React from 'react'
import { connect } from 'react-redux'

import Table from 'material-ui/lib/table/table'
import TableBody from 'material-ui/lib/table/table-body'
import TableFooter from 'material-ui/lib/table/table-footer'
import TableRow from 'material-ui/lib/table/table-row'
import TableRowColumn from 'material-ui/lib/table/table-row-column'

import Languages from '../../constants/Languages'

class Language extends React.Component {
  constructor(props) {
    super(props)
    this._handleClose = this._handleClose.bind(this)
    this._onRowSelection = this._onRowSelection.bind(this)
    this.addMenuItem = this.addMenuItem.bind(this)
  }

  _handleClose() {
    this.props.dispatch(asyncDialog({ open: false, name: '', title: '' }))
  }

  _onRowSelection(lang) {
    /* Set the selected Language on the APP */
    if (Languages[lang] !== undefined) {
      this.props.dispatch(asyncSetLanguage(Languages[lang].lang))
    }
  }

  addMenuItem(item, i) {
    /* Render the Languages from 'js/constants/Languages' */
    const { language } = this.props.data
    let selected = false
    if ( item.lang === language ) {
      selected = true
    }
    return (
      <TableRow key={i} selected={selected}>
        <TableRowColumn>{item.title}</TableRowColumn>
      </TableRow>
    )
  }

  render() {
    return (
      <div>
        <Table
          height={'300px'}
          fixedHeader
          fixedFooter
          selectable
          multiSelectable={false}
          onRowSelection={this._onRowSelection}>
          <TableBody
            deselectOnClickaway
            showRowHover={false}
            stripedRows={false}>
            {Languages.map(this.addMenuItem)}
          </TableBody>
          <TableFooter />
        </Table>
      </div>
    )
  }
}

Language.propTypes = {
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
export default connect(select)(Language)
