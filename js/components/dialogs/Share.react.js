import React from 'react'
import IconInfo from 'material-ui/lib/svg-icons/social/share'
import LanternDialog from './Dialog.react'
import ShareButton from '../ShareButton.react'


class Share extends React.Component {
  render() {
    return (
      <LanternDialog title="Share" icon = {<IconInfo color="white" />}>
        <div id="share">
          <h1>Share Lantern</h1>
          <div className="share__buttons">
            <ShareButton title="Email" icon="/img/social_icons/mail.svg" action="" />
            <ShareButton title="WeChat" icon="/img/social_icons/wechat.svg" action="" />
            <ShareButton title="GooglePlus" icon="/img/social_icons/gplus.svg" action="" />
            <ShareButton title="Facebook" icon="/img/social_icons/facebook.svg" action="" />
            <ShareButton title="Twitter" icon="/img/social_icons/twitter.svg" action="" />
            <ShareButton title="Github" icon="/img/social_icons/github.svg" action="" />
          </div>
        </div>
      </LanternDialog>
    )
  }
}

export default Share
