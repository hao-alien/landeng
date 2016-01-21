import React from 'react'

import LanternDialog from './Dialog.react'

class IllustratedDialog extends React.Component {
  render() {
    return (<LanternDialog title={this.props.title}
      icon={this.props.icon}>
      <div className="illustrated_header">
        <img src={"/img/illustrations/" + this.props.illustration} alt={this.props.title}/>
      </div>
      <div className="illustrated_body">
        {this.props.children}
      </div>
    </LanternDialog>)
  }
}

IllustratedDialog.propTypes = {
  title: React.PropTypes.string,
  icon: React.PropTypes.object,
  illustration: React.PropTypes.string,
}

export default IllustratedDialog
