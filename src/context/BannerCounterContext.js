import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { getCounters, getAuctionsTotals } from 'lib/api'

export const BannerCounterContext = React.createContext()

export const BannerCounterContextProvider = ({ children }) => {
  const [bannerState, setBannerState] = useState({
    loading: false,
    closedAuctionCount: 0,
    openAuctionCount: 0,
    highestBidHexId: 0,
    highestBidWorth: 0,
    cashbackAuctionCount: 0,
    minimal: false,
  })

  const setUpTotals = () => {
    getAuctionsTotals().then((response) => {
      setBannerState((s) => ({
        ...s,
        cashbackAuctionCount: response.data.auctions.total,
      }))
    })

    getCounters()
      .then((response) => {
        const { data } = response
        const { closedAuctionSize, openAuctionSize, highestBid } = data
        const parsedHighestBidWorth = parseFloat(highestBid.worth)
        setBannerState((s) => ({
          ...s,
          closedAuctionCount: closedAuctionSize,
          openAuctionCount: openAuctionSize,
          highestBidHexId: highestBid.hexId,
          highestBidWorth: parsedHighestBidWorth,
        }))
      })
      .catch((error) => {
        console.error('getCounters.error', error)
      })
  }

  useEffect(() => {
    setUpTotals()
  }, [])

  return (
    <BannerCounterContext.Provider value={[bannerState, setBannerState]}>
      {children}
    </BannerCounterContext.Provider>
  )
}

BannerCounterContextProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}
