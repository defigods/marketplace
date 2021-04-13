import React, { useContext, useEffect, useState } from 'react'
import * as R from 'ramda'

import { getToken, saveToken } from 'lib/auth'
import { useTranslation } from 'react-i18next'

import { UserContext } from 'context/UserContext'

import { getAuctionsTotals } from 'lib/api'

import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import MuiDialogContent from '@material-ui/core/DialogContent'
import MuiDialogActions from '@material-ui/core/DialogActions'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
})

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  )
})

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent)

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions)

const BannerNotification = () => {
  const { t, i18n } = useTranslation()
  const { state } = useContext(UserContext)
  const { isLoggedIn: userAuthenticated } = state
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (userAuthenticated) {
      let cookie = getToken('showNotificationBanner')
      console.debug('COOKIEEEE-start', cookie)

      if (R.isNil(cookie)) {
        console.debug('COOKIEEEE-2', cookie)
        setShowBanner(true)
      } else {
        cookie = cookie === 'false' ? false : true
        console.debug('COOKIEEEE-3', { cookie, userAuthenticated })
        setShowBanner(cookie)
      }
    } else {
      setShowBanner(false)
    }
  }, [userAuthenticated])

  const handleClose = () => {
    saveToken('showNotificationBanner', false)

    setShowBanner(false)
  }

  return (
    <>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={showBanner}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          {t('Lands.bannerNotification.morethan5land.title')}
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            {t('Lands.bannerNotification.morethan5land.text')}
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BannerNotification
