import React from 'react'

class ShareButton extends React.Component {
  render() {
    const svg = require(`../../img/social_icons/${this.props.icon}.svg`)
    return (
      <div className="share__button" onClick={this.props.clickHandler}>
        <div className={`share__button--${this.props.icon}`} dangerouslySetInnerHTML={{__html: svg}}></div>
        <span>{this.props.title}</span>
      </div>
    )
  }
}

ShareButton.propTypes = {
  title: React.PropTypes.string,
  icon: React.PropTypes.string,
  clickHandler: React.PropTypes.func,
}

export default ShareButton
