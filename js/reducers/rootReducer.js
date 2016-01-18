/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */

import pro from 'lantern-pro-js-client'
import { combineReducers } from 'redux';
import homeReducer from './homeReducer'
import purchaseReducer from './purchaseReducer'

// Replace line below once you have several reducers with
// import { combineReducers } from 'redux';
const rootReducer = combineReducers({ homeReducer, purchaseReducer })
// const rootReducer = homeReducer

export default rootReducer
