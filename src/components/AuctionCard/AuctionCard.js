
import React from 'react';
import LandName from '../LandName/LandName';
import ValueCounter from '../ValueCounter/ValueCounter';
import TimeCounter from '../TimeCounter/TimeCounter';
import { Link } from "react-router-dom";

const AuctionCard = props => {

  const { bid_status, background_image, name, value, location, date_end} = props
  const { sentence, hex} = name
  const { className, sentence: status } = bid_status

  // const changeValue = (value) => {
  //   if ( value > 300) {
  //     return 'this'
  //   }
  // }

  return (
    <div className={`AuctionCard ${className}`}>
      <Link to={`/map/land/${hex}`}>
      <div className="AuctionCard__header" style={{ backgroundImage: background_image }}>
        <div className="c-status-badge AuctionCard__status">{status}</div>
        <div className="AuctionCard__ping_container">
          <div className="c-ping-layer c-ping-layer-1"> </div>
          <div className="c-ping-layer c-ping-layer-2"> </div>
          <div className="c-ping-layer c-ping-layer-3"> </div>
          <div className="c-ping-layer c-ping-layer-4"> </div>
        </div>
      </div>
      </Link>
      <div className="AuctionCard__body">
        <LandName name={{ sentence: sentence, hex: hex }} location={location}></LandName>
        <div className="AuctionCard__bottom_line">
          <div className="o-half">
            <ValueCounter value={value}></ValueCounter> 
            {/* className={changeValue} */}
          </div>
          <div className="o-half">
            <TimeCounter time={20} signature="mins" date_end={date_end}></TimeCounter>
          </div>
        </div>
      </div>
    </div>



  )

}

export default AuctionCard