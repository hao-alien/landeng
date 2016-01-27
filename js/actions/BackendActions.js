/* eslint-disable no-use-before-define */

import {BACKEND_STATUS_CHANGED, BACKEND_MESSAGE_RECEIVED, BACKEND_MESSAGE_SENT, BACKEND_MESSAGE_FAILED_TO_SEND} from '../constants/BackendConstants'

export function connected(status) {
  return {type: BACKEND_STATUS_CHANGED, status: {connected: true}}
}
export function gone(status) {
  return {type: BACKEND_STATUS_CHANGED, status: {connected: false}}
}
export function message(status) {
  return {type: BACKEND_MESSAGE_RECEIVED, status: status}
}
export function asyncSendMessage(status) {
  return (dispatch) => {
    dispatch({type: BACKEND_MESSAGE_SENDING, status: status})
    return status.ws.send(status.ws.message, (error) => {
      if (!error) {
        dispatch({type: BACKEND_MESSAGE_SENT, status: status})
      } else {
        dispatch({type: BACKEND_MESSAGE_FAILED_TO_SEND, status: error})
      }
    })
  }
}
