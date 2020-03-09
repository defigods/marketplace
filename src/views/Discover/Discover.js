import React, { useState, useEffect } from 'react';
import './style.scss';
import { withMapContext } from '../../context/MapContext'
import AuctionCard from '../../components/AuctionCard/AuctionCard';

import { indexOpenAuctions } from '../../lib/api'
import { store } from 'react-notifications-component';

import Pagination from '@material-ui/lab/Pagination';


const Discover = (props) => {
  const [listAuctions, setListAuctions] = useState('');
  const [numberOfPages, setNumberOfPages] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  function loadAuctionPage(page){
    // Call API function 
    indexOpenAuctions(null, page)
    .then((response) => {

      // Load user data in context store
      // context.actions.loginUser(response.data.token, response.data.user )
      setListAuctions(response.data.auctions.map((auction) =>
        <AuctionCard key={auction.land.uuid}
          value={auction.currentWorth}
          background_image={`url(${auction.land.mapTileUrl}`}
          name={{sentence: auction.land.sentenceId, hex: auction.land.uuid}}
          location={auction.land.address.full}
          bid_status={{ className: "--bestbid", sentence: "BEST BID" }}
          date_end={auction.closeAt}
        />
      ))
      setNumberOfPages(response.data.numberOfPages)
    }).catch(() => {
      // Notify user if network error
       store.addNotification({
         title: "Connection error",
         message: "Check your internet connection or try again later",
         type: "danger",
         insert: "top",
         container: "top-right",
         animationIn: ["animated", "fadeIn"],
         animationOut: ["animated", "fadeOut"],
         showIcon: true,
         dismiss: {
           duration: 5000
         }
       })
    });
  }

  function handlePageClick(event, number) {
    loadAuctionPage(number)
    setCurrentPage(number)
  };

  useEffect(() => {
    loadAuctionPage()
  }, [])

  return (
    <div className="Overview">
      <div className="o-container">
        <h2 className="o-section-title">Auctions</h2>
      </div>
      <div className="o-auction-list">
        <div className="o-container">
          {listAuctions}
        </div>
      </div>
      <div className="o-pagination">
        {numberOfPages > 1 ? <Pagination count={numberOfPages} page={currentPage} onChange={handlePageClick} /> : ""}
      </div>
    </div>
  );
}

export default withMapContext(Discover);
