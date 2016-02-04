/* eslint-disable no-use-before-define */

import * as pro from 'lantern-pro-js-client'
import {asyncDialog} from './AppActions'
import * as constants from '../constants/ProAPIConstants'
import {WELCOME_TO_PRO_DIALOG} from '../constants/Dialogs'

let PRO_API = 'http://localhost:5000'

if (process.env.NODE_ENV === 'production') {
  PRO_API = 'http://quiet-island-5559.herokuapp.com'
}

export function asyncPurchase(status) {
  return (dispatch) => {
    dispatch({type: constants.INITIATE_PURCHASE, status: status})
    const {id: token, plan, email} = status
    const client = new pro.Client({ApiAddr: PRO_API, deviceId: 'fake-id'})
    return client.purchase(token, plan, email)
    .then( (res) => {
      dispatch({type: constants.PURCHASED, status: res})
      dispatch(asyncDialog({open: true, dialog: WELCOME_TO_PRO_DIALOG}))
    }).catch((e) => {
      console.error(e)
      dispatch({type: constants.PURCHASE_FAILED, status: e})
    })
  }
}

export function asyncCreateReferralCode(status) {
  return (dispatch) => {
    const {email} = status
    dispatch({type: constants.INITIATE_CREATE_USER, status: status})
    return doAsyncCreateUser(email).then( (res) => {
      dispatch({type: constants.USER_CREATED, status: res})
      return doAsyncCreateReferralCode(dispatch, res)
    }).catch((e) => {
      console.error(e)
      dispatch({type: constants.CREATE_USER_FAILED, status: e})
    })
  }
}

function doAsyncCreateUser(email) {
  const client = new pro.Client({ApiAddr: PRO_API, deviceId: 'fake-id'})
  return client.createUser(email)
}

function doAsyncCreateReferralCode(dispatch, {userId, token}) {
  const proClient = new pro.Client({ApiAddr: PRO_API, userId: userId, proToken: token, deviceId: 'fake-id'})
  dispatch({type: constants.INITIATE_CREATE_REFERRAL_CODE, status: status})
  return proClient.newReferralCode().then( (res) => {
    dispatch({type: constants.REFERRAL_CODE_CREATED, status: res})
  }).catch((e) => {
    console.error(e)
    dispatch({type: constants.CREATE_REFERRAL_CODE_FAILED, status: e})
  })
}
