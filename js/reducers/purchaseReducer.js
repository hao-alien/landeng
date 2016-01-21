import assignToEmpty from '../utils/assign'
import {INITIATE_PURCHASE, PURCHASED, PURCHASE_FAILED} from '../constants/ProAPIConstants'

const initialState = {}

function purchaseReducer(state = initialState, action) {
  Object.freeze(state) // Don't mutate state directly, always use assign()!
  switch (action.type) {
  case INITIATE_PURCHASE:
    return state
  case PURCHASED:
    return assignToEmpty({showResult: true, result: action.status})
  case PURCHASE_FAILED:
    return assignToEmpty({showError: true, error: action.status})
  default:
    return state
  }
}

export default purchaseReducer
