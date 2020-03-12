import React, { useState, useEffect, useContext } from 'react';
import './style.scss';
import { withMapContext, MapContext } from '../../context/MapContext'
import AuctionCard from '../../components/AuctionCard/AuctionCard';

import { indexOpenAuctions } from '../../lib/api'
import { networkError } from '../../lib/notifications'
import Pagination from '@material-ui/lab/Pagination';


const Discover = (props) => {
  const [listAuctions, setListAuctions] = useState('');
  const [numberOfPages, setNumberOfPages] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const { actions } = useContext(MapContext)
  
  function loadAuctionsByPage(page){
    // Call API function 
    indexOpenAuctions(null, page)
    .then((response) => {
      // Load Auctions in MapContext
      actions.changeAuctionList(response.data.auctions)
      console.log(response.data.auctions[0])
      // Load user data in context store
      setListAuctions(response.data.auctions.map((obj) =>
        <AuctionCard key={obj.land.uuid}
          value={obj.land.auction.currentWorth}
          background_image={`url(${obj.land.mapTileUrl}`}
          name={{sentence: obj.land.sentenceId, hex: obj.land.uuid}}
          location={obj.land.address.full}
          bid_status={"open"}
          date_end={obj.land.auction.closeAt}
        />
      ))
      setNumberOfPages(response.data.numberOfPages)
    }).catch(() => {
      // Notify user if network error
      networkError()
    });
  }

  function handlePageClick(event, number) {
    loadAuctionsByPage(number)
    setCurrentPage(number)
  };

  useEffect(() => {
    actions.disableSingleView()
    loadAuctionsByPage()
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
