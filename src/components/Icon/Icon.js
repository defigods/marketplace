import React, { Component } from 'react'
import { ReactSVG } from 'react-svg'

class Icon extends Component {
  render() {
    const isSVG = this.props.isSvg
    let icon

    if (isSVG === true) {
      icon = (
        <ReactSVG
          className={`Icon ${this.props.className}`}
          alt={this.props.alt}
          src={this.props.src}
          onClick={this.props.onClick}
        />
      )
    } else {
      icon = (
        <img
          className={`Icon ${this.props.className}`}
          alt={this.props.alt}
          src={this.props.src}
          onClick={this.props.onClick}
        ></img>
      )
    }

    return icon
  }
}

export default Icon
