import React, { useContext } from 'react'

import Breadcrumbs from './Breadcrumbs'

import { MapContext } from '../../context/MapContext'
import { useLocation } from 'react-router-dom'

const MapBreadcrumbs = () => {
  const { state } = useContext(MapContext)
  const { pathname } = useLocation()

  const { hex_id, landData: data } = state

  let currentPageLabel = pathname.split('/')[2]
  currentPageLabel =
    currentPageLabel.charAt(0).toUpperCase() + currentPageLabel.slice(1)

  const prevLinks = []

  const isAuction = data.marketStatus === 1
  const isUserRelated = data.userPerspective !== 0

  // console.log('This is the data', data);

  if (currentPageLabel === 'Land') {
    const dataIsEmpty =
      Object.keys(data).length === 0 && data.constructor === Object
    if (dataIsEmpty) {
      currentPageLabel = ''
    } else {
      prevLinks.push({
        href: `${isUserRelated ? '/map/overview' : '/map/discover'}`,
        label: `${isUserRelated ? 'My ' : ''}${
          isAuction ? 'Auctions' : 'Lands'
        }`,
      })

      currentPageLabel = (data.name && data.name.sentence) || hex_id
    }
  }

  return (
    <Breadcrumbs
      currentPageLabel={currentPageLabel}
      previousLinks={prevLinks}
    />
  )
}

export default MapBreadcrumbs
