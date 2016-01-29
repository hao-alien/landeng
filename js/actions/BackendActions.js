/* eslint-disable no-use-before-define */

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
      return dispatch({type: constants.BACKEND_SAVE_SETTINGS_FAILED, status: 'no WebSocket available'})
    }
    dispatch({type: constants.BACKEND_SAVE_SETTINGS, status: settings})
    const data = {Type: 'Settings', Message: settings}
    try {
      ws.send(JSON.stringify(data))
    } catch (error) {
      return dispatch({type: constants.BACKEND_SAVE_SETTINGS_FAILED, status: error})
    }
    return dispatch({type: constants.BACKEND_SETTINGS_SAVED, status: settings})
  }
}

export function asyncSaveUser(user) {
  return (dispatch) => {
    if (!ws) {
      return dispatch({type: constants.BACKEND_SAVE_USER_FAILED, status: 'no WebSocket available'})
    }
    dispatch({type: constants.BACKEND_SAVE_USER, status: user})
    const data = {Type: 'User', Message: user}
    try {
      ws.send(JSON.stringify(data))
    } catch (error) {
      return dispatch({type: constants.BACKEND_SAVE_USER_FAILED, status: error})
    }
    return dispatch({type: constants.BACKEND_USER_SAVED, status: user})
  }
}
