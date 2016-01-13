import pro from 'lantern-pro-js-client'
import {PURCHASE} from '../constants/ProAPIConstants'

const PRO_API = 'http://localhost:5000'

const initialState = {
  dialog: {
    open: false,
    name: '',
  },
  openMenu: false,
  language: 'EN',
  settings: {
    systemStart: true,
    proxyTraffic: false,
    sendStatistics: false,
  },
  pro: {
    status: 'ok'
  }
}

function purchaseReducer(state = initialState, action) {
  Object.freeze(state) // Don't mutate state directly, always use assign()!
  switch (action.type) {
    case PURCHASE:
      return assignToEmpty({pro: purchase(state)})
    default:
      return state
  }
}

export default purchaseReducer

function purchase(state) {
  let client = pro.Client({ApiAddr: PRO_API, deviceId: 'fake-id'})
  return client.purchase(state.id, pro.TRIAL_PLAN, state.email)
  .then( (res) => {
    return res
  }, (e) => {
    return state
  })
}
