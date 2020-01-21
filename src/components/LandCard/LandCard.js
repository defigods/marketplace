
import React, { Component } from 'react';
import LandName from '../LandName/LandName';
import Icon from '../Icon/Icon';
import TimeCounter from '../TimeCounter/TimeCounter';

class LandCard extends Component {

  render() {
    return <div className="LandCard">
              <Icon src={this.props.icon.url} isSvg={this.props.icon.isSvg}></Icon>
              <div className="LandCard__body">
                <LandName name={{ sentence: this.props.name.sentence, hex: this.props.name.hex }} location={this.props.location}></LandName>
                <div className="LandCard__body__footer">
                  <TimeCounter time={20} signature="mins" date_end={this.props.date_end}></TimeCounter>
                </div>
              </div>
            </div>;
  }
}

export default LandCard