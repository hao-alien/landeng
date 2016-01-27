/* eslint-disable no-use-before-define */

import assignToEmpty from '../utils/assign'
import {BACKEND_STATUS_CHANGED, BACKEND_MESSAGE_RECEIVED, BACKEND_MESSAGE_SENDING, BACKEND_MESSAGE_SENT, BACKEND_MESSAGE_FAILED_TO_SEND} from '../constants/BackendConstants'

let ws = null

export function connected(status) {
  ws = status.ws
  return {type: BACKEND_STATUS_CHANGED, status: {connected: true}}
}
export function gone(status) {
  ws = null
  return {type: BACKEND_STATUS_CHANGED, status: {connected: false}}
}
export function message(status) {
      return {type: BACKEND_MESSAGE_RECEIVED, status: status}
}
export function asyncSendMessage(status) {
  return (dispatch) => {
    if (!ws) {
      return dispatch({type: BACKEND_MESSAGE_FAILED_TO_SEND, status: "invalid WebSocket"})
    }
    dispatch({type: BACKEND_MESSAGE_SENDING, status: status})
    let data = {Type: 'Settings', Message: status}
    return ws.send(JSON.stringify(data), (error) => {
      if (!error) {
        return dispatch({type: BACKEND_MESSAGE_SENT, status: status})
      } else {
        return dispatch({type: BACKEND_MESSAGE_FAILED_TO_SEND, status: error})
      }
    })
  }
}
