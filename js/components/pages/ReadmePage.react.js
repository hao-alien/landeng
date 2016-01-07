/*
 * ReadmePage
 *
 * This is the page users see when they click the "ReadMe" button on the HomePage
 */

import React, { Component } from 'react'
import { Link } from 'react-router'

export default class ReadmePage extends Component {
  render() {
    return (
      <div>
        <h2>Grund Control to Major Tom</h2>
        <Link className="btn" to="/">Home</Link>
      </div>
    )
  }
}
