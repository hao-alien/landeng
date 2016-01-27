import assignToEmpty from '../utils/assign'
import {BACKEND_STATUS_CHANGED, BACKEND_MESSAGE_RECEIVED, BACKEND_MESSAGE_SENT, BACKEND_MESSAGE_FAILED_TO_SEND} from '../constants/BackendConstants'

const initialState = {connected: false}

export default function backendReducer(state = initialState, action) {
  Object.freeze(state) // Don't mutate state directly, always use assign()!
  switch (action.type) {
    case BACKEND_STATUS_CHANGED:
      return assignToEmpty(state, {connected: action.status.connected})
    case BACKEND_MESSAGE_RECEIVED:
      return assignToEmpty(state, {connected: true, settings: action.status.settings})
    case BACKEND_MESSAGE_SENT:
      return assignToEmpty(state, {connected: true, settings: assignToEmpty(state.settings, action.status.settings)})
    case BACKEND_MESSAGE_FAILED_TO_SEND:
      return assignToEmpty(state, {connected: false, lastError: error})
    default:
      return state
  }
}
