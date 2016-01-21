import React from 'react'
import IconInfo from 'material-ui/lib/svg-icons/action/info'
import LanternDialog from './Dialog.react'


class About extends React.Component {
  render() {
    return (
      <LanternDialog title="About" icon = {<IconInfo color="white" />}>
        <div id="about">
          <img src="/img/logo.svg" />
          <h1>Open Internet for Everyone</h1>
          <p>Lantern is an application that delivers fast, reliable and secure access to the open Internet.</p>
          <a href="">Questions?</a>
          <a href="">Read the Lantern FAQs</a>
        </div>
      </LanternDialog>
    )
  }
}

export default About
