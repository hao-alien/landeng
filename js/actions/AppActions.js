/*
 * Actions change things in your application
 * Since this we use a uni-directional data flow (redux),
 * we have these actions which are the only way your application interacts with
 * your appliction state. This guarantees that your state is up to date and nobody
 * messes it up weirdly somewhere.
 *
 * To add a new Action:
 * 1) Import your constant
 * 2) Add a function like this:
 *    export function yourAction(var) {
 *        return { type: YOUR_ACTION_CONSTANT, var: var }
 *    }
 * 3) (optional) Add an async function like this:
 *    export function asyncYourAction(var) {
 *        return (dispatch) => {
 *             // Do async stuff here
 *             return dispatch(yourAction(var));
 *        };
 *    }
 *
 *    If you add an async function, remove the export from the function
 *    created in the second step
 */

// Disable the no-use-before-define eslint rule for this file
// It makes more sense to have the asnyc actions before the non-async ones
/* eslint-disable no-use-before-define */

import i18next from 'i18next/lib'
import { DIALOG, OPEN_MENU, LANGUAGE, LANTERN } from '../constants/AppConstants'

/* MainNav functions */
export function asyncOpenMenu(status) {
  return (dispatch) => {
    return dispatch(openMenu(status))
  }
}

export function openMenu(status) {
  return { type: OPEN_MENU, status }
}

/* Dialog component functions */
export function asyncDialog(status) {
  return (dispatch) => {
    return dispatch(openDialog(status))
  }
}

export function openDialog(status) {
  return { type: DIALOG, status }
}

export function noDialog() {
  return openDialog({open: false, dialog: null})
}

/* Language Modal functions */
export function asyncSetLanguage(name) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      i18next.changeLanguage(name, (err, t) => {
        if (!err) {
          return dispatch(setLanguage(name))
        }
        reject(err)
      })
    })
  }
}

export function setLanguage(name) {
  return { type: LANGUAGE, name }
}

/* Settings Modal functions */
export function asyncLanternStatus(obj) {
  return (dispatch) => {
    return dispatch(setLanternStatus(obj))
  }
}

export function setLanternStatus(obj) {
  return { type: LANTERN, obj }
}
