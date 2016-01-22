/**
 * ProgressCircle.react.js
 * This component shows the ProgressCircle chart of the timeLeft of lantern PRO
 */

import React from 'react'

class ProgressCircle extends React.Component {

  constructor(props) {
    super(props)
  }

  componentDidUpdate() {
    const percent = parseInt((this.props.percent * 100 ) / this.props.topPercents[this.props.reference], 10)
    const element = this.refs[this.props.reference]
    const deg = parseInt((360 * percent) / 100, 10)
    element.style.transform = 'rotate(' + deg + 'deg)'
  }

  classSet(classes) {
    return typeof classes !== 'object' ?
      Array.prototype.join.call(arguments, ' ') :
      Object.keys(classes).filter( (className) => {
        return classes[className]
      }).join(' ')
  }

  render() {
    const percent = Math.floor(this.props.percent)
    const fill = parseInt((this.props.percent * 100 ) / this.props.topPercents[this.props.reference], 10)
    const classes = this.classSet({
      'progress-pie-chart': true,
      'gt-50': fill > 50,
    })
    return (
      <div className="progress clearfix">
        <div className={classes}>
          <div className="ppc-progress">
            <div className="ppc-progress-fill" ref={this.props.reference}></div>
          </div>
          <div className="ppc-percents">
            <div className="pcc-percents-wrapper">
              <span className="ppc-percent">{percent}</span>
              <span className="ppc-label">{this.props.reference}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ProgressCircle.propTypes = {
  percent: React.PropTypes.number,
  reference: React.PropTypes.string,
  topPercents: React.PropTypes.object,
}

ProgressCircle.defaultProps = {
  topPercents: {
    'months': 12,
    'days': 30,
    'hours': 24,
    'minutes': 60,
    'seconds': 60,
  },
}

export default ProgressCircle
