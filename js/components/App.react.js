/**
 * App.react.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import injectTapEventPlugin from 'react-tap-event-plugin'

import Navigation from './Navigation.react'
import LanternStatus from './LanternStatus.react'
import * as backend from '../actions/BackendActions'

/* Needed for onTouchTap
 * Can go away when react 1.0 release
 * Check this repo:
 * https://github.com/zilverline/react-tap-event-plugin
 */
injectTapEventPlugin()

class App extends Component {
  componentWillMount() {
    this.initWebsocket()
  }

  componentWillUnmount() {
    this.closing = true
    this.ws.close()
  }

  initWebsocket() {
    let url = document.location
    this.ws = new WebSocket("ws://" + url.host + '/data');
    this.ws.onopen = (event) => {
      this.props.dispatch(backend.connected({ws: this.ws}));
    };

    this.ws.onclose = (event) => {
      this.props.dispatch(backend.gone());
      if (!this.closing) {
        window.setTimeout(() => {
          this.initWebsocket()
        }, 2000); // reconnect every 2s
      }
    };

    this.ws.onmessage = (event) => {
      var message = JSON.parse(event.data);
      this.props.dispatch(backend.message(message));
    };
  }

  render() {
    return (
      <div className="wrapper">
        <div id="main_nav">
          <Navigation />
        </div>
        <LanternStatus />
        <section id="top_sheet">
          <img className="logo" src="/img/lantern_logo.svg" />
        </section>
        { this.props.children }
      </div>
    )
  }
}

App.propTypes = {
  data: React.PropTypes.object,
  children: React.PropTypes.element,
}

App.contextTypes = {
  router: React.PropTypes.object
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state,
  }
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(App)
