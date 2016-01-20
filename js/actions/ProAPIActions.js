/* eslint-disable no-use-before-define */

import * as pro from 'lantern-pro-js-client'
import assignToEmpty from '../utils/assign'
import {INITIATE_PURCHASE, PURCHASED, PURCHASE_FAILED} from '../constants/ProAPIConstants'

const PRO_API = 'http://localhost:5000'

export function asyncPurchase(status) {
  return (dispatch) => {
    dispatch({type: INITIATE_PURCHASE, status: status})
    let {id: token, plan, email} = status
    let client = new pro.Client({ApiAddr: PRO_API, deviceId: 'fake-id'})
    return client.purchase(token, plan, email)
    .then( (res) => {
      dispatch({type: PURCHASED, status: res})
    }, (e) => {
      console.log("failed" + e)
      dispatch({type: PURCHASE_FAILED, status: e})
    })
  }
}
