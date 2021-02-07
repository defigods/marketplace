import React, { Component } from 'react'
import TextCounter from '../TextCounter/TextCounter'

import { Textfit } from 'react-textfit'

class LandName extends Component {
  render() {
    return (
      <div className="LandName">
        {this.props.value && (
          <TextCounter value={this.props.value} label="OVR"></TextCounter>
        )}
        <div className="LandName__name">
          <Textfit mode="single" max={17}>
            {this.props.name.sentence}
          </Textfit>
        </div>
        <div className="LandName__location"> {this.props.location} </div>
      </div>
    )
  }
}

export default LandName
