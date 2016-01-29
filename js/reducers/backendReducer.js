import assignToEmpty from '../utils/assign'
import * as constants from '../constants/BackendConstants'

const initialState = {connected: false, Settings: {Language: 'en', Pro: false}}

export default function backendReducer(state = initialState, action) {
  Object.freeze(state) // Don't mutate state directly, always use assign()!
  switch (action.type) {
  case constants.BACKEND_STATUS_CHANGED:
    return assignToEmpty(state, action.status)
  case constants.BACKEND_MESSAGE_RECEIVED:
    let message = {}
    if (action.status.Type === 'Settings') {
      message = {connected: true, Settings: assignToEmpty(state.Settings, action.status.Message)}
    } else {
      console.error('unknown message type', action.status.Type)
      message = {connected: true}
    }
    return assignToEmpty(state, message)
  case constants.BACKEND_SAVE_SETTINGS:
    return state // TODO
  case constants.BACKEND_SETTINGS_SAVED:
    return assignToEmpty(state, {connected: true, Settings: assignToEmpty(state.Settings, action.status)})
  case constants.BACKEND_SAVE_SETTINGS_FAILED:
    return assignToEmpty(state, {connected: false, lastError: action.status})
  case constants.BACKEND_SAVE_USER:
    return state // TODO
  case constants.BACKEND_USER_SAVED:
    return assignToEmpty(state, {connected: true, User: assignToEmpty(state.User, action.status)})
  case constants.BACKEND_SAVE_USER_FAILED:
    return assignToEmpty(state, {connected: false, lastError: action.status})
  default:
    return state
  }
}
