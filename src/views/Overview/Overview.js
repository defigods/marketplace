import React, { useState, useEffect, useContext } from 'react';
import './style.scss';
import { withMapContext, MapContext } from '../../context/MapContext'
import AuctionCard from '../../components/AuctionCard/AuctionCard';
import LandCard from '../../components/LandCard/LandCard';

import { indexMyOpenAuctions, indexMyLands } from '../../lib/api'
import { networkError } from '../../lib/notifications'
import Pagination from '@material-ui/lab/Pagination';

const Overview = (props) => {
  const [listAuctions, setListAuctions] = useState('');
  const [numberOfAuctionPages, setNumberOfAuctionPages] = useState(0);
  const [currentAuctionPage, setCurrentAuctionPage] = useState(1);

  const [listLands, setListLands] = useState('');
  const [numberOfLandPages, setNumberOfLandPages] = useState(0);
  const [currentLandPage, setCurrentLandPage] = useState(1);
  const [userAuthenticated, setUserAuthenticated] = useState(true);

  const { actions } = useContext(MapContext)

  function loadAuctionsByPage(page) {
    // Call API function 
    indexMyOpenAuctions(null, page)
      .then((response) => {
        console.log(response)
        if (response.data.result === true){
          // Load Auctions in MapContext
          actions.changeAuctionList(response.data.auctions)

          if (response.data.auctions.length > 0) {
            // Load user data in context store
            setListAuctions(response.data.auctions.map((obj) =>
              <AuctionCard key={obj.land.uuid}
                value={obj.land.auction.currentWorth}
                background_image={`url(${obj.land.mapTileUrl}`}
                name={{ sentence: obj.land.sentenceId, hex: obj.land.uuid }}
                location={obj.land.address.full}
                bid_status={"open"}
                date_end={obj.land.auction.closeAt}
              />
            ))
            setNumberOfAuctionPages(response.data.numberOfPages)
          } else {
            setListAuctions(
              <div className="c-dialog --centered">
                <div className="c-dialog-main-title">
                  There is currently no <div className="c-status-badge">OPEN</div> auction  ⚡️
              </div>
                <div className="c-dialog-sub-title">
                  Browse the OVRLands: search for a location or click a point in the map and mint a land now.
              </div>
              </div>
            )
          }
        } else {
          setUserAuthenticated(false)
        }
      }).catch(() => {
        // Notify user if network error
        networkError()
      });
  }

  function loadLandsByPage(page) {
    // Call API function 
    indexMyLands(null, page)
      .then((response) => {
        if (response.data.result === true) {
          // Load Lands in MapContext
          if (response.data.lands.length > 0) {
            // Load user data in context store
            setListLands(response.data.lands.map((obj) =>
              <LandCard key={obj.uuid}
                url="/"
                value={obj.currentWorth}
                background_image={`url(${obj.mapTileUrl}`}
                name={{ sentence: obj.sentenceId, hex: obj.uuid }}
                location={obj.address.full}
                icon={{ url: "./assets/icons/icon_deal.png", isSvg: false }}
                date_end={obj.auction.closeAt}
              ></LandCard>
            ))
            setNumberOfLandPages(response.data.numberOfPages)
          } else {
            setListLands(
              <div className="c-dialog --centered">
                <div className="c-dialog-main-title">
                  There is currently no lands to display
              </div>
                <div className="c-dialog-sub-title">
                  Browse the aviable OVRLands: mint a land and own it now.
              </div>
              </div>
            )
          }
        }
      }).catch((error) => {
        // Notify user if network error
        networkError()
      });
  }

  function handleAuctionPageClick(event, number) {
    loadAuctionsByPage(number)
    setCurrentAuctionPage(number)
  };

  function handleLandPageClick(event, number) {
    loadLandsByPage(number)
    setCurrentLandPage(number)
  };

  useEffect(() => {
    actions.disableSingleView()
    loadAuctionsByPage()
    loadLandsByPage()
  }, [])

  let customReturn

  if (userAuthenticated){
    customReturn = <div className="Overview">
      <div className="o-container">
        <h2 className="o-section-title">Auctions</h2>
      </div>
      <div className="o-container">
        <div className="o-auction-list">
          {listAuctions}
        </div>
        <div className="o-pagination">
          {numberOfAuctionPages > 1 ? <Pagination count={numberOfAuctionPages} page={currentAuctionPage} onChange={handleAuctionPageClick} /> : ""}
        </div>
      </div>
      <div className="o-container">
        <h2 className="o-section-title">Lands</h2>
      </div>
      <div className="o-container">
        <div className="o-land-list">
          {listLands}
        </div>
        <div className="o-pagination">
          {numberOfLandPages > 1 ? <Pagination count={numberOfLandPages} page={currentLandPage} onChange={handleLandPageClick} /> : ""}
        </div>
      </div>
    </div>
  } else {
    customReturn = <div className="Overview">
      <div className="o-container">
        <div className="c-dialog --centered">
          <div className="c-dialog-main-title">
            You have to log in to visit Overview 😎
          </div>
          <div className="c-dialog-sub-title">
            Browse your OVRLands and ongoing Auctions. Login now.
          </div>
        </div>
      </div>
    </div>
  }

  return (
    customReturn
  );
}

export default withMapContext(Overview);

