import React from 'react'
import { connect } from 'react-redux'

import Table from 'material-ui/lib/table/table'
import TableBody from 'material-ui/lib/table/table-body'
import TableFooter from 'material-ui/lib/table/table-footer'
import TableRow from 'material-ui/lib/table/table-row'
import TableRowColumn from 'material-ui/lib/table/table-row-column'

import LanternDialog from './Dialog.react'
import languages from '../../constants/Languages'
import { asyncSetLanguage } from '../../actions/AppActions'


class Language extends React.Component {
  constructor(props) {
    super(props)
    this._onRowSelection = this._onRowSelection.bind(this)
    this.addLangItem = this.addLangItem.bind(this)
  }

  _onRowSelection(lang) {
    /* Set the selected Language on the APP */
    if (languages[lang] !== undefined) {
      this.props.dispatch(asyncSetLanguage(languages[lang].lang))
    }
  }

  addLangItem(item, i) {
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
      <LanternDialog
        title="Languages"
        icon={this.props.icon}>
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
              {languages.map(this.addLangItem)}
            </TableBody>
            <TableFooter />
          </Table>
      </LanternDialog>
    )
  }
}

Language.propTypes = {
  data: React.PropTypes.object,
  dispatch: React.PropTypes.func,
  icon: React.PropTypes.object,
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state.homeReducer,
  }
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(Language)
