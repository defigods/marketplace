import React, { useContext } from 'react'
import * as R from 'ramda'

import Breadcrumbs from './Breadcrumbs'

import { NewMapContext } from 'context/NewMapContext'
import { useLocation } from 'react-router-dom'

const MapBreadcrumbs = ({ contextState }) => {
  const landData = R.pathOr({}, ['landData'], contextState)
  const hex_id = R.pathOr(null, ['hex_id'], contextState)

  const marketStatus = R.pathOr(null, ['marketStatus'], landData)
  const userPerspective = R.pathOr(null, ['userPerspective'], landData)

  const { pathname } = useLocation()

  let currentPageLabel = pathname.split('/')[2]
  currentPageLabel =
    currentPageLabel.charAt(0).toUpperCase() + currentPageLabel.slice(1)

  const prevLinks = []

  const isAuction = marketStatus === 1
  const isUserRelated = userPerspective !== 0

  if (currentPageLabel === 'Land') {
    const dataIsEmpty =
      Object.keys(landData).length === 0 && landData.constructor === Object
    if (dataIsEmpty) {
      currentPageLabel = ''
    } else {
      prevLinks.push({
        href: `${isUserRelated ? '/map/overview' : '/map/discover'}`,
        label: `${isUserRelated ? 'My ' : ''}${
          isAuction ? 'Auctions' : 'Lands'
        }`,
      })

      currentPageLabel = (landData.name && landData.name.sentence) || hex_id
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
