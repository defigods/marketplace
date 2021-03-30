import React, { useState, useEffect, useContext } from 'react'

import './style.scss'
import { MapContext } from '../../context/MapContext'
import AuctionCard from '../../components/AuctionCard/AuctionCard'
import LandCard from '../../components/LandCard/LandCard'

import { indexOpenAuctions, indexLands } from '../../lib/api'
import { networkError } from '../../lib/notifications'
import Pagination from '@material-ui/lab/Pagination'
import { Trans, useTranslation } from 'react-i18next'
import { HashRouter as Router, Route, Link } from 'react-router-dom'

import { saveToken } from '../../lib/auth'

const Discover = (props) => {
  const { t, i18n } = useTranslation()

  const [listAuctions, setListAuctions] = useState('')
  const [numberOfAuctionPages, setNumberOfAuctionPages] = useState(0)
  const [currentAuctionPage, setCurrentAuctionPage] = useState(1)

  const [listLands, setListLands] = useState('')
  const [numberOfLandPages, setNumberOfLandPages] = useState(0)
  const [currentLandPage, setCurrentLandPage] = useState(1)

  const { actions } = useContext(MapContext)

  function loadAuctionsByPage(page) {
    // Call API function
    indexOpenAuctions(null, page)
      .then((response) => {
        // Load Auctions in MapContext
        actions.changeAuctionList(response.data.auctions)
        // console.log(response.data.auctions);

        if (response.data.auctions.length > 0) {
          // Load user data in context store
          setListAuctions(
            response.data.auctions.map((obj) => (
              <AuctionCard
                key={obj.land.hexId}
                value={obj.land.auction.currentWorth}
                background_image={`url(${obj.land.mapTileUrl}`}
                name={{ sentence: obj.land.sentenceId, hex: obj.land.hexId }}
                location={obj.land.address.full}
                market_status={obj.land.marketStatus}
                user_perspective={obj.land.userPerspective}
                date_end={obj.land.auction.closeAt}
              />
            ))
          )
          setNumberOfAuctionPages(response.data.numberOfPages)
        } else {
          setListAuctions(
            <div className="c-dialog --centered">
              <div className="c-dialog-main-title">
                <Trans i18nKey="Discover.no.auctions.open">
                  There is currently no{' '}
                  <div className="c-status-badge">OPEN</div> auction
                </Trans>{' '}
                ⚡️
              </div>
              <div className="c-dialog-sub-title">
                {t('Discover.browse.lands')}
              </div>
            </div>
          )
        }
      })
      .catch(() => {
        // Notify user if network error
        console.log('NetworkErrorCode: 1232')
        networkError()
      })
  }

  function loadLandsByPage(page) {
    // console.log('load land');
    // Call API function
    indexLands(null, page)
      .then((response) => {
        console.log('ooo', response.data.lands)
        // Load Lands in MapContext
        if (response.data.lands.length > 0) {
          // Load user data in context store
          setListLands(
            response.data.lands.map((obj) => (
              <LandCard
                key={obj.hexId}
                url="/"
                value={obj.currentWorth}
                background_image={`url(${obj.mapTileUrl}`}
                name={{ sentence: obj.sentenceId, hex: obj.hexId }}
                location={obj.address.full}
                date_end={obj.auction.closeAt}
              ></LandCard>
            ))
          )
          setNumberOfLandPages(response.data.numberOfPages)
        } else {
          setListLands(
            <div className="c-dialog --centered">
              <div className="c-dialog-main-title">
                {t('Discover.no.lands')}
              </div>
              <div className="c-dialog-sub-title">
                {t('Discover.browse.available')}
              </div>
            </div>
          )
        }
      })
      .catch((error) => {
        console.log(error)
        // Notify user if network error
        console.log('NetworkErrorCode: 12326')
        networkError()
      })
  }

  function handleAuctionPageClick(event, number) {
    loadAuctionsByPage(number)
    setCurrentAuctionPage(number)
  }

  function handleLandPageClick(event, number) {
    loadLandsByPage(number)
    setCurrentLandPage(number)
  }

  function setupReferralUserCookie() {
    saveToken('referred_by_user', props.match.params.ref)
  }

  useEffect(() => {
    actions.disableSingleView()
    loadAuctionsByPage()
    loadLandsByPage()
    setupReferralUserCookie()
  }, [])

  return (
    <div className="Overview">
      <div className="o-container">
        <h2 className="o-section-title  --w-link">
          <span>{t('Discover.auctions.label')}</span>
          <Link to="/map/lands" className="o-select-multiple-land-link">
            {t('Lands.select.multiple.lands')}
          </Link>
        </h2>
      </div>
      <div className="o-container">
        <div className="o-auction-list">{listAuctions}</div>
        <div className="o-pagination">
          {numberOfAuctionPages > 1 && (
            <Pagination
              count={numberOfAuctionPages}
              page={currentAuctionPage}
              onChange={handleAuctionPageClick}
            />
          )}
        </div>
      </div>
      <div className="o-container">
        <h2 className="o-section-title">{t('Discover.closed.auctions')}</h2>
      </div>
      <div className="o-container">
        <div className="o-land-list">{listLands}</div>
        <div className="o-pagination">
          {numberOfLandPages > 1 && (
            <Pagination
              count={numberOfLandPages}
              page={currentLandPage}
              onChange={handleLandPageClick}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Discover
