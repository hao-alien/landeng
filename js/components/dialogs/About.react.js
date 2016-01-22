import React from 'react'
import LanternDialog from './Dialog.react'


class About extends React.Component {
  render() {
    return (
      <LanternDialog
        title="About"
        icon={this.props.icon}>
          <div id="about">
            <img className="about_logo" src="/img/lantern_logo.svg" />
            <h1>Open Internet for Everyone</h1>
            <p>Lantern is an application that delivers fast, reliable and secure access to the open Internet.</p>
            <a href="">Questions?</a>
            <a href="">Read the Lantern FAQs</a>
          </div>
      </LanternDialog>
    )
  }
}

About.propTypes = {
  icon: React.PropTypes.object,
}

export default About
