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

      if (response.data.auctions.length > 0){
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
      } else {
        setListAuctions(
          <div className="c-dialog --centered">
            <div className="c-dialog-main-title">
              There is currently no <div class="c-status-badge">OPEN</div> auction  ⚡️
            </div>
            <div className="c-dialog-sub-title">
              Browse the OVRLands: search for a location or click a point in the map and mint a land now.
            </div>
          </div>
        )
      }
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
