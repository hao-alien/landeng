/**
 *
 * TimeLeftPro.react.js
 * This component shows the TimeLeftPro to getlantern PRO
 */


import React from 'react'
import ProgressCircle from './ProgressCircle.react'

class TimeLeftPro extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
    this.getTimeRemaining = this.getTimeRemaining.bind(this)
  }

  componentWillMount() {
    const timeLeft = this.getTimeRemaining(this.props.deadline)
    this.setState({months: timeLeft.days / 30})
    this.setState({days: timeLeft.days})
    this.setState({hours: timeLeft.hours})
    this.setState({minutes: timeLeft.minutes})
    this.setState({seconds: timeLeft.seconds})
  }

  componentDidMount() {
    setInterval( () => {
      const timeLeft = this.getTimeRemaining(this.props.deadline)
      this.setState(timeLeft)
    }, 1000 )
  }

  getTimeRemaining(endtime) {
    const t = Date.parse(endtime) - Date.parse(new Date())
    const seconds = Math.floor( (t / 1000) % 60 )
    const minutes = Math.floor( (t / 1000 / 60) % 60 )
    const hours = Math.floor( (t / (1000 * 60 * 60)) % 24 )
    const days = Math.floor( t / (1000 * 60 * 60 * 24) )
    return {
      months: parseInt(days / 30, 10),
      days: days % 30,
      hours,
      minutes,
      seconds,
    }
  }

  render() {
    return (
      <div>
        <p>Time Left on your LanterPRO account</p>
        <ProgressCircle percent={this.state.months} reference="months" />
        <ProgressCircle percent={this.state.days} reference="days" />
        <ProgressCircle percent={this.state.hours} reference="hours" />
        <ProgressCircle percent={this.state.minutes} reference="minutes" />
        <ProgressCircle percent={this.state.seconds} reference="seconds" />
        <p>Invite more friends and get more time for Free!</p>
      </div>
    )
  }
}

TimeLeftPro.propTypes = {
  deadline: React.PropTypes.string,
}

export default TimeLeftPro
