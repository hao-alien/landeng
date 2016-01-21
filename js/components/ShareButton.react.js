import React from 'react'

class ShareButton extends React.Component {
  render() {
    return (
      <div className="share__buton">
        <img src={this.props.icon} />
        <span>{this.props.title}</span>
      </div>
    )
  }
}

ShareButton.propTypes = {
  title: React.PropTypes.string,
  icon: React.PropTypes.string,
}

export default ShareButton
