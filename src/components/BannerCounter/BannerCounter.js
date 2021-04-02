import React, { useContext } from 'react'

import { useTranslation } from 'react-i18next'
import { BannerCounterContext } from 'context/BannerCounterContext'

import ArrowLink from 'components/ArrowLink/ArrowLink'
import { useHistory } from 'react-router-dom'

const BannerCounter = () => {
  const { t } = useTranslation()
  let history = useHistory()

  const [bannerState] = useContext(BannerCounterContext)

  const {
    closedAuctionCount,
    openAuctionCount,
    highestBidHexId,
    highestBidWorth,
    cashbackAuctionCount,
  } = bannerState

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
                  onClick={() => {
                    history.push('/map/land/' + highestBidHexId)
                  }}
                />
              </div>
            </div>
            <div className="o-one-label">
              <div className="o-label">{t('BannerCounter.open.auctions')}</div>
              <div className="o-value --big">{openAuctionCount}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BannerCounter
