import React, { useEffect } from 'react'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreIcon from '@material-ui/icons/MoreHoriz'
import Fade from '@material-ui/core/Fade'
import { useHistory } from 'react-router-dom'
import * as moment from 'moment'
import { promisify } from 'lib/config'
import config from 'lib/config'
import { useTranslation } from 'react-i18next'

import MarketPlaceIcon01 from 'assets/img/icone-marketplace-01.png'
import MarketPlaceIcon06 from 'assets/img/icone-marketplace-06.png'
import MarketPlaceIcon09 from 'assets/img/icone-marketplace-09.png'
import MarketPlaceIcon05 from 'assets/img/icone-marketplace-05.png'
import MarketPlaceIcon10 from 'assets/img/icone-marketplace-10.png'
import MarketPlaceIcon04 from 'assets/img/icone-marketplace-04.png'

const NotificationTile = (props) => {
  const { data } = props
  const { t, i18n } = useTranslation()
  let history = useHistory()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [pending, setPending] = React.useState(props.data.status === 0)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleGoTo = () => {
    setAnchorEl(null)
    history.push('/map/land/' + props.data.hexId)
  }

  const formatTextContent = (content) => {
    return content.replace(
      props.data.landSentence,
      '<span>' + props.data.landSentence + '</span>'
    )
  }

  const handleEtherscan = () => {
    setAnchorEl(null)
    let etherscanLink = config.apis.etherscan + '/tx/' + props.data.txHash
    window.open(etherscanLink, '_blank')
  }

  const setAsReaded = () => {}

  const renderIcon = () => {
    switch (props.data.typeOf) {
      // 10 start
      // 11 outbidded
      // 11 Best bidder
      // 13 win
      case 10:
        return <img src={MarketPlaceIcon01} />
        break
      case 13:
        return <img src={MarketPlaceIcon06} />
        break
      case 11:
        return <img src={MarketPlaceIcon05} />
        break
      case 12:
        return <img src={MarketPlaceIcon09} />
        break
      case 14:
        return <img src={MarketPlaceIcon10} />
        break
      default:
        return <img src={MarketPlaceIcon04} />
    }
  }

  return (
    <div
      key={data.uuid}
      className={`ActivityTile ${!pending ? '--new' : ''}`}
      onClick={setAsReaded}
    >
      <div className="ActivityTile__head">
        <div className="ActivityTile__icon">{renderIcon()}</div>
      </div>
      <div className="ActivityTile__body">
        <div className="ActivityTile__time">
          {moment(data.createdAt).format('HH:mm, dddd, MMM D, YYYY')}
        </div>
        <div
          className="ActivityTile__content"
          dangerouslySetInnerHTML={{
            __html: formatTextContent(data.content),
          }}
        ></div>
      </div>
      <IconButton
        aria-label="more"
        aria-controls="fade-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreIcon />
      </IconButton>
      <Menu
        id="fade-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={handleGoTo}>{t('ActivityTile.goto.land')}</MenuItem>
        {props.data.txHash && (
          <MenuItem onClick={handleEtherscan}>
            {t('ActivityTile.view.ether')}
          </MenuItem>
        )}
      </Menu>
    </div>
  )
}

export default NotificationTile
