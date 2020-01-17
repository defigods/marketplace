
import React, { Component } from 'react';
import LandName from '../LandName/LandName';
import ValueCounter from '../ValueCounter/ValueCounter';
import TimeCounter from '../TimeCounter/TimeCounter';


class AuctionCard extends Component {

  

  render() {
    return <div className={`AuctionCard ${this.props.bid_status.className}`}>
              <div className="AuctionCard__header" style={{ backgroundImage: this.props.background_image }}>
                <div className="AuctionCard__status">{this.props.bid_status.sentence}</div>
                <div className="AuctionCard__ping_container">
                  <div className="c-ping-layer c-ping-layer-1"> </div>
                  <div className="c-ping-layer c-ping-layer-2"> </div>
                  <div className="c-ping-layer c-ping-layer-3"> </div>
                  <div className="c-ping-layer c-ping-layer-4"> </div>
                </div>
              </div>
              <div className="AuctionCard__body">
                <LandName name={{ sentence: this.props.name.sentence, hex: this.props.name.hex }} location={this.props.location}></LandName>
                <div className="AuctionCard__bottom_line">
                  <div className="o-half">
                    <ValueCounter value={this.props.value}></ValueCounter>
                  </div>
                  <div className="o-half">
                    <TimeCounter time={20} signature="mins"></TimeCounter>
                  </div>
                </div>
              </div>
            </div>;
  }
}

export default AuctionCard