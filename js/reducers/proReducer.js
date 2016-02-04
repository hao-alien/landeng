import assignToEmpty from '../utils/assign'
import * as constants from '../constants/ProAPIConstants'

const initialState = {error: '', result: null}

function proReducer(state = initialState, action) {
  Object.freeze(state) // Don't mutate state directly, always use assign()!
  switch (action.type) {
  case constants.INITIATE_PURCHASE:
  case constants.INITIATE_CREATE_USER:
  case constants.INITIATE_CREATE_REFERRAL_CODE:
    return assignToEmpty(state, initialState)
  case constants.PURCHASED:
  case constants.USER_CREATED:
  case constants.REFERRAL_CODE_CREATED:
    return assignToEmpty(state, {error: '', result: action.status})
  case constants.PURCHASE_FAILED:
  case constants.CREATE_USER_FAILED:
  case constants.CREATE_REFERRAL_CODE_FAILED:
    return assignToEmpty(state, {error: action.status, result: null})
  default:
    return state
  }
}

export default proReducer
