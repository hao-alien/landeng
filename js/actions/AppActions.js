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

import { CHANGE_PROJECT_NAME, DIALOG, OPEN_MENU, LANGUAGE } from '../constants/AppConstants'

export function asyncChangeProjectName(name) {
  return (dispatch) => {
    // You can do async stuff here!
    // API fetching, Animations,...
    // For more information as to how and why you would do this, check https://github.com/gaearon/redux-thunk
    return dispatch(changeProjectName(name))
  }
}

export function changeProjectName(name) {
  return { type: CHANGE_PROJECT_NAME, name }
}

export function asyncDialog(status) {
  return (dispatch) => {
    return dispatch(openDialog(status))
  }
}

export function openDialog(status) {
  return { type: DIALOG, status }
}

export function asyncOpenMenu(status) {
  return (dispatch) => {
    return dispatch(openMenu(status))
  }
}

export function openMenu(status) {
  return { type: OPEN_MENU, status }
}

export function asyncSetLanguage(name) {
  return (dispatch) => {
    return dispatch(setLanguage(name))
  }
}

export function setLanguage(name) {
  return { type: LANGUAGE, name }
}
