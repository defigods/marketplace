import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import * as moment from 'moment'

import { Breadcrumbs as MaterialBreadcrumbs } from '@material-ui/core'
import { Link } from 'react-router-dom'

import { NewMapContext } from 'context/NewMapContext'

import NavigateNextIcon from '@material-ui/icons/NavigateNext'

const Breadcrumbs = ({ previousLinks, currentPageLabel, className }) => {
  const currentDatetimeStamp = moment().format('HH:mm, dddd, MMM D, YYYY')

  const { mapState, setMapState, actions } = useContext(NewMapContext)

  // Clicking Link returning to /map/discover
  const resetSingleLandView = () => {
    // In this case I have to reset hex_id to avoid map zoom explosions
    setMapState((s) => ({ ...s, hex_id: null }))
  }

  return (
    <div className={`breadcrumbs ${className}`}>
      <MaterialBreadcrumbs
        className={'breadcrumbs--items'}
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {previousLinks.map((a, index) => (
          <Link
            className="breadcrumbs--prevlink"
            key={`prev_link_${index}`}
            color="inherit"
            to={a.href}
            onClick={resetSingleLandView}
          >
            {a.label}
          </Link>
        ))}
        <span className="breadcrumbs--currentlabel">{currentPageLabel}</span>
      </MaterialBreadcrumbs>
      <span className="breadcrumbs--datetime">{currentDatetimeStamp}</span>
    </div>
  )
}

Breadcrumbs.propTypes = {
  previousLinks: PropTypes.arrayOf(
    PropTypes.shape({ href: PropTypes.string, label: PropTypes.string })
  ),
  currentPageLabel: PropTypes.string,
  className: PropTypes.string,
}
Breadcrumbs.defaultProps = {
  previousLinks: [],
  currentPageLabel: 'undefined',
  className: '',
}
export default Breadcrumbs
