import assignToEmpty from '../utils/assign'
import {BACKEND_STATUS_CHANGED, BACKEND_MESSAGE_RECEIVED, BACKEND_MESSAGE_SENDING, BACKEND_MESSAGE_SENT, BACKEND_MESSAGE_FAILED_TO_SEND} from '../constants/BackendConstants'

const initialState = {connected: false}

export default function backendReducer(state = initialState, action) {
  Object.freeze(state) // Don't mutate state directly, always use assign()!
  switch (action.type) {
    case BACKEND_STATUS_CHANGED:
      return assignToEmpty(state, action.status)
    case BACKEND_MESSAGE_RECEIVED:
      if (action.status.Type === 'Settings') {
      return assignToEmpty(state, {connected: true, Settings: action.status.Message})
    } else {
      console.error("unknown message type", action.status.Type)
      return assignToEmpty(state, {connected: true})
    }
    case BACKEND_MESSAGE_SENDING:
      return state // TODO
    case BACKEND_MESSAGE_SENT:
      return assignToEmpty(state, {connected: true, settings: assignToEmpty(state.settings, action.status.settings)})
    case BACKEND_MESSAGE_FAILED_TO_SEND:
      return assignToEmpty(state, {connected: false, lastError: action.status.error})
    default:
      return state
  }
}
