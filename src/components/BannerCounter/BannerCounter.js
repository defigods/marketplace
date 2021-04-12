import React, { useContext } from 'react'
import * as R from 'ramda'

import { useTranslation } from 'react-i18next'
import { BannerCounterContext } from 'context/BannerCounterContext'
import { NewMapContext } from 'context/NewMapContext'

import ArrowLink from 'components/ArrowLink/ArrowLink'
import { useHistory } from 'react-router-dom'

import { Web3Context } from 'context/Web3Context'

import closedAuctions from 'assets/img/closedAuctions.svg'
import highestBid from 'assets/img/highestBid.svg'
import currentlyOpenAuctions from 'assets/img/currentlyOpenAuctions.svg'
import ovrIcon from 'assets/img/ovr.svg'

import arrow from 'assets/img/arrow.svg'

const BannerCounter = () => {
  const { state, actions: web3Actions } = useContext(Web3Context)
  const { ibcoCurrentOvrPrice } = state
  const { getUSDValueInOvr } = web3Actions

  console.debug('ibcoCurrentOvrPrice', ibcoCurrentOvrPrice)

  const { t } = useTranslation()
  let history = useHistory()

  const [bannerState, setBannerState] = useContext(BannerCounterContext)
  const { minimal } = bannerState
  const { mapState, setMapState, actions } = useContext(NewMapContext)
  const { changeHexId } = actions

  const {
    closedAuctionCount,
    openAuctionCount,
    highestBidHexId,
    highestBidWorth,
    cashbackAuctionCount,
  } = bannerState

  const onClickHighestBidLand = () => {
    changeHexId(highestBidHexId)
    history.push('/map/land/' + highestBidHexId)
  }

  const toggleHideElements = () => {
    const el = document.querySelector('.BannerCounter')
    if (minimal) {
      setBannerState((s) => ({
        ...s,
        minimal: false,
      }))
      el.classList.remove('minimal')
    } else {
      setBannerState((s) => ({
        ...s,
        minimal: true,
      }))
      el.classList.add('minimal')
    }
  }

  return (
    <section className={`BannerCounter ${minimal ? 'minimal' : ''}`}>
      <a className="arrow-expand" onClick={toggleHideElements}>
        <img src={arrow} />
      </a>
      <div className="row">
        <div className="column">
          <div className="single-item">
            <div className="icon">
              <img src={closedAuctions} />
            </div>
            <div className="text">
              <h5>{closedAuctionCount}</h5>
              <p>Closed Auctions</p>
            </div>
          </div>
        </div>

        <div className="column hide-column">
          <div className="single-item">
            <div className="icon">
              <img src={highestBid} />
            </div>
            <div className="text">
              <h5>{highestBidWorth} OVR</h5>
              <p>Highest Bid</p>
              <ArrowLink
                text={t('BannerCounter.visit.ovrland')}
                onClick={onClickHighestBidLand}
              />
            </div>
          </div>
        </div>

        <div className="column hide-column">
          <div className="single-item">
            <div className="icon">
              <img src={currentlyOpenAuctions} />
            </div>
            <div className="text">
              <h5>{openAuctionCount}</h5>
              <p>Open Auctions</p>
              <ArrowLink
                url="https://www.ovr.ai/how-to-participate-auction/"
                target="_blank"
                text={t('BannerCounter.auction.how-to-partecipate-auction')}
                onClick={onClickHighestBidLand}
              />
            </div>
          </div>
        </div>

        {R.isNil(ibcoCurrentOvrPrice) ? null : (
          <div className="column hide-column">
            <div className="single-item">
              <div className="icon">
                <img id="ovr-icon" src={ovrIcon} />
              </div>
              <div className="text">
                <h5>{(1 / ibcoCurrentOvrPrice).toFixed(4)} USD</h5>
                <p>Current OVR price</p>
                <ArrowLink
                  url="/public-sale"
                  text={t('Profile.buy.ovr')}
                  onClick={onClickHighestBidLand}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default BannerCounter
