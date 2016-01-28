/* eslint-disable no-use-before-define */

import assignToEmpty from '../utils/assign'
import * as constants from '../constants/BackendConstants'

let ws = null

export function connected(status) {
  ws = status.ws
  return {type: constants.BACKEND_STATUS_CHANGED, status: {connected: true}}
}
export function gone() {
  ws = null
  return {type: constants.BACKEND_STATUS_CHANGED, status: {connected: false}}
}
export function message(msg) {
  return {type: constants.BACKEND_MESSAGE_RECEIVED, status: msg}
}
export function asyncSaveSettings(settings) {
  return (dispatch) => {
    if (!ws) {
      return dispatch({type: constants.BACKEND_SAVE_SETTINGS_FAILED, status: "no WebSocket available"})
    }
    dispatch({type: constants.BACKEND_SAVE_SETTINGS, status: settings})
    let data = {Type: 'Settings', Message: settings}
    try {
      ws.send(JSON.stringify(data))
    } catch (error) {
      return dispatch({type: constants.BACKEND_SAVE_SETTINGS_FAILED, status: error})
    }
    return dispatch({type: constants.BACKEND_SETTINGS_SAVED, status: settings})
  }
}
