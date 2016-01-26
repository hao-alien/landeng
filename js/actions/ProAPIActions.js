/* eslint-disable no-use-before-define */

import * as pro from 'lantern-pro-js-client'
import {asyncDialog} from './AppActions'
import {INITIATE_PURCHASE, PURCHASED, PURCHASE_FAILED} from '../constants/ProAPIConstants'
import {WELCOME_TO_PRO_DIALOG} from '../constants/Dialogs'

let PRO_API = 'http://localhost:5000'

if (process.env.NODE_ENV === 'production') {
  PRO_API = 'http://quiet-island-5559.herokuapp.com'
}

export function asyncPurchase(status) {
  return (dispatch) => {
    dispatch({type: INITIATE_PURCHASE, status: status})
    const {id: token, plan, email} = status
    const client = new pro.Client({ApiAddr: PRO_API, deviceId: 'fake-id'})
    return client.purchase(token, plan, email)
    .then( (res) => {
      dispatch({type: PURCHASED, status: res})
      dispatch(asyncDialog({open: true, dialog: WELCOME_TO_PRO_DIALOG}))
    }, (e) => {
      dispatch({type: PURCHASE_FAILED, status: e})
    })
  }
}
