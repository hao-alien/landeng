/* eslint-disable no-use-before-define */

import * as pro from 'lantern-pro-js-client'
import assignToEmpty from '../utils/assign'
import {INITIATE_PURCHASE, PURCHASED, PURCHASE_FAILED} from '../constants/ProAPIConstants'

const PRO_API = 'http://localhost:5000'

export function asyncPurchase(status) {
  return (dispatch) => {
    dispatch({type: INITIATE_PURCHASE, status: status})
    let client = new pro.Client({ApiAddr: PRO_API, deviceId: 'fake-id'})
    return client.purchase(status.id, status.plan, status.email)
    .then( (res) => {
      console.log(res)
      dispatch({type: PURCHASED, status: status})
    }, (e) => {
      console.log("failed" + e)
      dispatch({type: PURCHASE_FAILED, status: status})
    })
  }
}
