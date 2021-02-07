import React from 'react'
import LandName from '../LandName/LandName'
import ValueCounter from '../ValueCounter/ValueCounter'
import TimeCounter from '../TimeCounter/TimeCounter'
import { Link } from 'react-router-dom'

const AuctionCard = (props) => {
  const {
    user_perspective,
    background_image,
    name,
    value,
    location,
    date_end,
    market_status,
  } = props
  const { sentence, hex } = name
  let statusClassName = '--open'
  let statusText = 'OPEN'

  switch (user_perspective) {
    case 1:
      statusClassName = '--open'
      statusText = 'OPEN'
      break
    case 2:
      statusClassName = '--bestbid'
      statusText = 'BEST BID'
      break
    case 3:
      statusClassName = '--outbidded'
      statusText = 'OUTBIDDED'
      break
    default:
      statusClassName = '--open'
      statusText = 'OPEN'
      break
  }

  switch (market_status) {
    case 10:
      statusClassName = '--open'
      statusText = 'CLOSING'
      break
    default:
      break
  }

  return (
    <div className={`AuctionCard ${statusClassName}`}>
      <Link to={`/map/land/${hex}`}>
        <div
          className="AuctionCard__header"
          style={{ backgroundImage: background_image }}
        >
          <div className="c-status-badge AuctionCard__status">{statusText}</div>
          <div className="AuctionCard__ping_container">
            <div className="c-ping-layer c-ping-layer-1"> </div>
            <div className="c-ping-layer c-ping-layer-2"> </div>
            <div className="c-ping-layer c-ping-layer-3"> </div>
            <div className="c-ping-layer c-ping-layer-4"> </div>
          </div>
        </div>
      </Link>
      <div className="AuctionCard__body">
        <LandName
          name={{ sentence: sentence, hex: hex }}
          location={location}
        ></LandName>
        <div className="AuctionCard__bottom_line">
          <div className="o-half">
            <ValueCounter value={value}></ValueCounter>
            {/* className={reloadLandStatefromApi} */}
          </div>
          <div className="o-half">
            <TimeCounter
              time={20}
              signature="mins"
              date_end={date_end}
            ></TimeCounter>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuctionCard
