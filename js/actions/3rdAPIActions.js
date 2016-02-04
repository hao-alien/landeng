import ga from 'react-google-analytics'
import {SENDING_EMAIL, EMAIL_SENT, SEND_EMAIL_FAILED} from '../constants/AppConstants'

export function asyncSendMobileLink(email) {
  return (dispatch) => {
    const api = 'https://mandrillapp.com/api/1.0/messages/send-template.json'
    let config = {
      method: 'POST',
      body: JSON.stringify({
        'key': 'fmYlUdjEpGGonI4NDx9xeA',
        'template_name': 'lantern-mobile-message',
        'template_content': {},
        'message': { 'to': [ { 'email': email } ] }
      })
    }
    dispatch({type: SENDING_EMAIL, status: {} })
    return fetch(api, config).then((res) => {
      dispatch({type: EMAIL_SENT, status: {} })
    }, (err) => {
      dispatch({type: EMAIL_SENT_FAILED, status: {} })
    })
  }
}

export function trackSendMobileLink() {
  return (dispatch) => {
    initGA()
    ga('send', 'send-link-to-mobile');
  }
}

let gaInitialized = false
function initGA() {
  if (gaInitialized) {
    return
  }
  ga('create', 'UA-21815217-13', 'auto')
  ga('set', {
    anonymizeIp: true,
    forceSSL: true,
    location: 'http://lantern-ui/',
    hostname: 'lantern-ui',
    title: 'lantern-ui'
  });
  gaInitialized = true
}

function trackPageView() {
  ga('send', 'pageview');
}

function trackSendLinkToMobile() {
  ga('send', 'send-link-to-mobile');
}

function trackCopyLink() {
  ga('send', 'send-link-to-mobile');
}
