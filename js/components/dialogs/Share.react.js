import React from 'react'
import IconInfo from 'material-ui/lib/svg-icons/social/share'
import LanternDialog from './Dialog.react'
import ShareButton from '../ShareButton.react'

class Share extends React.Component {
  constructor(props) {
    super(props)
    this.shareWindow = this.shareWindow.bind(this)
    this.share = this.share.bind(this)
  }

  shareWindow(option) {
    if (option.popup) {
      const top = ((window.innerHeight / 2) - (option.height / 2))
      const left = ((window.innerWidth / 2) - (option.width / 2))
      window.open(option.url, 'shareLantern', `location=1,status=1,width=${option.width},height=${option.height},top=${top},left=${left}`)
    } else {
      window.open(option.url)
    }
  }

  share(option) {
    const that = this
    const shareURL = 'https://getlantern.com'
    const shareText = 'Get Lantern'
    const shareEndpoints = {
      facebook: {
        popup: true,
        width: 560,
        height: 450,
        url: `https://www.facebook.com/sharer/sharer.php?u=${shareURL}`,
        action() {
          that.shareWindow(this)
        },
      },
      github: {
        popup: false,
        url: 'https://github.com/getlantern/lantern',
        action() {
          that.shareWindow(this)
        },
      },
      gplus: {
        popup: true,
        width: 510,
        height: 500,
        url: `https://plus.google.com/share?url=${shareURL}`,
        action() {
          that.shareWindow(this)
        },
      },
      mail: {
        popup: false,
        url: `mailto:?subject=${shareText}`,
        action() {
          window.location.href = this.url
        },
      },
      twitter: {
        popup: true,
        width: 630,
        height: 300,
        url: `https://twitter.com/intent/tweet?text=${shareText} - ${shareURL}`,
        action() {
          that.shareWindow(this)
        },
      },
      wechat: {
        popup: true,
        url: `${shareText} - ${shareURL}`,
        action() {
          console.log(`WeChat ${this.url}`)
        },
      },
    }
    shareEndpoints[option].action()
  }

  render() {
    return (
      <LanternDialog title="Share" icon = {<IconInfo color="white" />}>
        <div id="share">
          <h1>Share Lantern</h1>
          <div className="share__buttons">
            <ShareButton title="Email" icon="mail" clickHandler={this.share.bind(null, 'mail')} />
            <ShareButton title="WeChat" icon="wechat" clickHandler={this.share.bind(null, 'wechat')} />
            <ShareButton title="GooglePlus" icon="gplus" clickHandler={this.share.bind(null, 'gplus')} />
            <ShareButton title="Facebook" icon="facebook" clickHandler={this.share.bind(null, 'facebook')} />
            <ShareButton title="Twitter" icon="twitter" clickHandler={this.share.bind(null, 'twitter')} />
            <ShareButton title="Github" icon="github" clickHandler={this.share.bind(null, 'github')} />
          </div>
        </div>
      </LanternDialog>
    )
  }
}

export default Share
