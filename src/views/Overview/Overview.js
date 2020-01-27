import React from 'react';
import './style.scss';
import { withMapContext } from '../../context/MapContext'
import AuctionCard from '../../components/AuctionCard/AuctionCard';

const Overview = (props) => {
  console.log(props)
  const listAuctions = props.mapProvider.overviewList.map((auction) =>
    <AuctionCard key={auction.key}
    url="/"
    value={auction.value}
    background_image={auction.background_image}
    name={auction.name}
    location={auction.location}
    bid_status={auction.bid_status}
    date_end={auction.date_end}
    />
  );
  
  return (
    <div className="Overview">
        <div className="o-container">
          <h2 className="o-section-title">My Auctions</h2>
        </div>
        <div className="o-auction-list">
          <div className="o-container">
            {listAuctions}
          </div>
        </div>
    </div>
  );
}

export default withMapContext(Overview);
