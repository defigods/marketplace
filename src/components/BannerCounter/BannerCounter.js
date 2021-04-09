import React, { useContext } from 'react'

import { useTranslation } from 'react-i18next'
import { BannerCounterContext } from 'context/BannerCounterContext'
import { NewMapContext } from 'context/NewMapContext'

import ArrowLink from 'components/ArrowLink/ArrowLink'
import { useHistory } from 'react-router-dom'

const BannerCounter = () => {
  const { t } = useTranslation()
  let history = useHistory()

  const [bannerState] = useContext(BannerCounterContext)
  const [mapState, setMapState, actions] = useContext(NewMapContext)
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

    // mapState
    history.push('/map/land/' + highestBidHexId)
  }

  return (
    <>
      <div className="BannerCounter">
        <div className="--standard">
          <div className="o-row --banner-header">
            <div className="o-one-label">
              <div className="o-label">
                {t('BannerCounter.closed.auctions')}
              </div>
              <div className="o-value">{closedAuctionCount}</div>
              <div className="o-cashback-copy">
                {t('Cashback.banner.desc', { total: cashbackAuctionCount })}
              </div>
            </div>
            <div className="o-one-label">
              <div className="o-label">{t('BannerCounter.highest.bid')}</div>
              <div className="o-value">{highestBidWorth} OVR</div>
              <div className="o-link">
                <ArrowLink
                  text={t('BannerCounter.visit.ovrland')}
                  onClick={onClickHighestBidLand}
                />
              </div>
            </div>
            <div className="o-one-label">
              <div className="o-label">{t('BannerCounter.open.auctions')}</div>
              <div className="o-value">{openAuctionCount}</div>
              <div className="o-link">
                <ArrowLink
                  url="https://www.ovr.ai/how-to-participate-auction/"
                  target="_blank"
                  text={t('BannerCounter.auction.how-to-partecipate-auction')}
                  onClick={onClickHighestBidLand}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BannerCounter
