import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import * as h3 from 'h3-js'
import _ from 'lodash'

export const NewMapContext = React.createContext()

export const NewMapContextProvider = ({ children }) => {
  const [mapState, setMapState] = useState({
    onSingleView: false,
    hex_id: '8c81326dda43dff',
    integer_id: 632776805293768200,
    isAuction: false,
    isUserRelated: false,
    activeBidOverlay: false,
    activeMintOverlay: false,
    activeSellOverlay: false,
    activeBuyOfferOverlay: false,
    activeBuyOverlay: false,
    onMultipleLandSelection: false,
    multipleLandSelectionList: [],
    auctionList: [],
    landData: {},
  })

  const changeHexId = (hex_id) => {
    if (h3.h3IsValid(hex_id)) {
      setMapState((s) => ({
        onSingleView: true,
        hex_id: hex_id,
        integer_id: parseInt(hex_id, 16),
        isAuction: true,
      }))
    }
  }

  const enableMultipleLandSelection = () => {
    setMapState((s) => ({ ...s, onMultipleLandSelection: true }))
  }

  const disableMultipleLandSelection = () => {
    setMapState((s) => ({ ...s, onMultipleLandSelection: false }))
  }

  const disableSingleView = () => {
    setMapState((s) => ({ ...s, onSingleView: false }))
  }

  const changeLandData = (data) => {
    setMapState((s) => ({ ...s, landData: data }))
  }

  const changeAuctionList = (list) => {
    setMapState((s) => ({ ...s, auctionList: list }))
  }

  const changeMultipleLandSelectionList = (list) => {
    setMapState((s) => ({ ...s, multipleLandSelectionList: _.uniq(list) }))
  }

  const resetMultipleLandSelectionList = (list) => {
    setMapState((s) => ({ ...s, multipleLandSelectionList: [] }))
  }

  const changeActiveBidOverlay = (activeVal) => {
    setMapState((s) => ({ ...s, activeBidOverlay: activeVal }))
  }

  const changeActiveMintOverlay = (activeVal) => {
    setMapState((s) => ({ ...s, activeMintOverlay: activeVal }))
  }

  const changeActiveSellOverlay = (activeVal) => {
    setMapState((s) => ({ ...s, activeSellOverlay: activeVal }))
  }

  const changeActiveBuyOfferOverlay = (activeVal) => {
    setMapState((s) => ({ ...s, activeBuyOfferOverlay: activeVal }))
  }

  const changeActiveBuyOverlay = (activeVal) => {
    setMapState((s) => ({ ...s, activeBuyOverlay: activeVal }))
  }

  const actions = {
    changeHexId,
    enableMultipleLandSelection,
    disableMultipleLandSelection,
    disableSingleView,
    changeLandData,
    changeAuctionList,
    changeMultipleLandSelectionList,
    resetMultipleLandSelectionList,
    changeActiveBidOverlay,
    changeActiveMintOverlay,
    changeActiveSellOverlay,
    changeActiveBuyOfferOverlay,
    changeActiveBuyOverlay,
  }

  return (
    <NewMapContext.Provider value={[mapState, setMapState, actions]}>
      {children}
    </NewMapContext.Provider>
  )
}

NewMapContextProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}
