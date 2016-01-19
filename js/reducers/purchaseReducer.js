import assignToEmpty from '../utils/assign'
import {INITIATE_PURCHASE, PURCHASED, PURCHASE_FAILED} from '../constants/ProAPIConstants'

const initialState = {}

function purchaseReducer(state = initialState, action) {
  Object.freeze(state) // Don't mutate state directly, always use assign()!
  switch (action.type) {
    case INITIATE_PURCHASE:
      return assignToEmpty({pro: purchase(action.status)})
    case PURCHASED:
      return assignToEmpty({pro: purchase(action.status)})
    case PURCHASE_FAILED:
      return assignToEmpty({pro: purchase(action.status)})
    default:
      return state
  }
}

function purchase(state) {
  return state
}

export default purchaseReducer
