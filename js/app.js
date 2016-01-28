/**
 *
 * app.js
 *
 * This is the entry file for the application, mostly just setup and boilerplate
 * code.
 * Routes are configured at the end of this file!
 *
 */
/*
// Load the ServiceWorker, the Cache polyfill, the manifest.json file and the .htaccess file
import 'file?name=[name].[ext]!../serviceworker.js'
import 'file?name=[name].[ext]!../manifest.json'
import 'file?name=[name].[ext]!../.htaccess'

// Check for ServiceWorker support before trying to install it
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./serviceworker.js').then(() => {
    // Registration was successful
  }).catch(() => {
    // Registration failed
  })
} else {
  // No ServiceWorker Support
}
*/
// Import all the third party stuff
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, Redirect } from 'react-router'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import createHistory from 'history/lib/createBrowserHistory'
import { I18nextProvider } from 'react-i18next/lib'

import HomePage from './components/pages/HomePage.react'
import App from './components/App.react'
import i18n from './i18n'

// Import the CSS file, which HtmlWebpackPlugin transfers to the build folder
import '../css/main.css'

// Create the store with the redux-thunk middleware, which allows us
// to do asynchronous things in the actions
import rootReducer from './reducers/rootReducer'
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore)
const store = createStoreWithMiddleware(rootReducer)

// Make reducers hot reloadable, see http://stackoverflow.com/questions/34243684/make-redux-reducers-and-other-non-components-hot-loadable
if (module.hot) {
  module.hot.accept('./reducers/rootReducer', () => {
    const nextRootReducer = require('./reducers/rootReducer').default
    store.replaceReducer(nextRootReducer)
  })
}

// Mostly boilerplate, except for the Routes. These are the pages you can go to,
// which are all wrapped in the App component, which contains the navigation etc
ReactDOM.render(
  <I18nextProvider i18n={ i18n }>
    <Provider store={store}>
      <Router history={createHistory()}>
        <Route component={App}>
          <Route path="/" component={HomePage} />
          <Redirect from="*" to="/" />
        </Route>
      </Router>
    </Provider>
  </I18nextProvider>,
  document.getElementById('app')
)
