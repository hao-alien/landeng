import assignToEmpty from '../utils/assign'
import * as constants from '../constants/BackendConstants'

const initialState = {connected: false, settings: {language: 'en', pro: false}}

function firstToLower(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
};

function camelCase(o) {
  let ret = {}
  for (let key of Object.keys(o)) {
    let v = o[key]
    if (v && typeof v === 'object') {
      v = camelCase(v)
    }
    ret[firstToLower(key)] = v;
  }
  return ret;
};


export default function backendReducer(state = initialState, action) {
  Object.freeze(state) // Don't mutate state directly, always use assign()!
  switch (action.type) {
    case constants.BACKEND_STATUS_CHANGED:
      return assignToEmpty(state, action.status)
    case constants.BACKEND_MESSAGE_RECEIVED:
      // Go backend can send JSON with all keys capitalized.
      // Convert all to camelCased to keep consistency in JS code.
      const status = camelCase(action.status)
      let message = {}
      if (status.type === 'settings') {
        message = {connected: true, settings: assignToEmpty(state.settings, status.message)}
      } else {
        console.error('unknown message type', status.type)
        message = {connected: true}
      }
      return assignToEmpty(state, message)
    case constants.BACKEND_SAVE_SETTINGS:
      return state // TODO
    case constants.BACKEND_SETTINGS_SAVED:
      return assignToEmpty(state, {connected: true, settings: assignToEmpty(state.settings, action.status)})
    case constants.BACKEND_SAVE_SETTINGS_FAILED:
      return assignToEmpty(state, {connected: false, lastError: action.status})
    case constants.BACKEND_SAVE_USER:
      return state // TODO
    case constants.BACKEND_USER_SAVED:
      return assignToEmpty(state, {connected: true, user: assignToEmpty(state.user, action.status)})
    case constants.BACKEND_SAVE_USER_FAILED:
      return assignToEmpty(state, {connected: false, lastError: action.status})
    default:
      return state
  }
}
