import React, { useState, useEffect, useContext } from 'react'
import { withUserContext } from 'context/UserContext'
import { withWeb3Context } from 'context/Web3Context'
import ValueCounter from '../ValueCounter/ValueCounter'
import HexButton from '../HexButton/HexButton'
import { warningNotification, dangerNotification } from 'lib/notifications'

import MenuItem from '@material-ui/core/MenuItem'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import MenuList from '@material-ui/core/MenuList'

// import { sellLand } from 'lib/api';
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

import { NewMapContext } from 'context/NewMapContext'

const BuyLandOverlay = (props) => {
  const { t, i18n } = useTranslation()
  const [mapState, setMapState, actions] = useContext(NewMapContext)
  const { activeBuyOverlay } = mapState
  const { changeActiveBuyOverlay } = actions

  const { approveOvrTokens, buy, buyLand } = props.web3Provider.actions
  const { ovr, ico, setupComplete } = props.web3Provider.state

  const { hexId } = props.land
  const { marketStatus } = props.land

  const [buyAt, setBuyAt] = useState(props.currentBid)
  const [activeStep, setActiveStep] = useState(0)
  const [metamaskMessage, setMetamaskMessage] = useState(
    t('MetamaskMessage.set.waiting')
  )
  const [showOverlay, setShowOverlay] = useState(false)
  const [classShowOverlay, setClassShowOverlay] = useState(false)

  const anchorRef = React.useRef(null)
  const [open, setOpen] = React.useState(false)

  // Listener for fadein and fadeout animation of overlay
  useEffect(() => {
    if (activeBuyOverlay) {
      setShowOverlay(true)
      setTimeout(() => {
        setClassShowOverlay(true)
      }, 50)
    } else {
      setClassShowOverlay(false)
      setTimeout(() => {
        setShowOverlay(false)
      }, 500)
    }
  }, [activeBuyOverlay])

  // Toggle bidding menu of selection currencies
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }
    setOpen(false)
  }
  const handleClick = () => {
    setOpen(true)
  }

  const setNextBidSelectedLand = async () => {
    if (!setupComplete || !ico || !ovr) {
      return false
    }
    const landId = parseInt(hexId, 16)
    const land = await ico.landsAsync(landId)
    const price = String(window.web3.fromWei(land[7]))
    setBuyAt(price)
  }

  // Init helpers web3
  useEffect(() => {
    if (setupComplete) setNextBidSelectedLand()
  }, [setupComplete, ico, hexId, marketStatus, activeBuyOverlay])

  function setDeactiveOverlay(e) {
    e.preventDefault()
    changeActiveBuyOverlay(false)
    // Bring the step at 0
    setTimeout(function () {
      setActiveStep(0)
      setBuyAt(10)
    }, 200)
  }

  // Helper used to check if the user is logged in
  const checkUserLoggedIn = () => {
    if (!props.userProvider.state.isLoggedIn) {
      setActiveStep(0)
      warningNotification(
        t('Warning.invalid.auth.title'),
        t('Warning.invalid.auth.desc')
      )
      return false
    }
    return true
  }

  // Manages actions of overlay according to step number
  const handleNext = async () => {
    if (activeStep + 1 === 1) {
      if (!checkUserLoggedIn()) {
        return false
      }
      try {
        let currentBalance = await ovr.balanceOfAsync(
          window.web3.eth.defaultAccount
        )
        if (!currentBalance.greaterThan(buyAt)) {
          return dangerNotification(
            t('Danger.balance.insuff.title'),
            t('Danger.balance.insuff.desc')
          )
        }
        setMetamaskMessage(t('MetamaskMessage.set.approve.ovr'))
        await approveOvrTokens(true, ovr)
        setMetamaskMessage(t('MetamaskMessage.set.waiting.buy'))
        await buyLand(hexId)
        handleNext()
        // TODO Centralized flux
      } catch (e) {
        console.log('Error', e)
        return dangerNotification(t('Danger.error.processing.title'), e.message)
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  // Show content of overlay according to step number
  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <div className="Overlay__body_cont">
            <div className="Overlay__upper">
              <div className="Overlay__title">
                {t('BuyLandOverlay.buy.land')}
              </div>
              <div className="Overlay__land_title">
                {props.land.name.sentence}
              </div>
              <div className="Overlay__land_hex">{props.land.location}</div>
            </div>
            <div className="Overlay__lower">
              <div className="Overlay__bids_container">
                <div className="Overlay__bid_container">
                  <div className="Overlay__minimum_bid">
                    <div className="Overlay__bid_title">
                      {t('BuyLandOverlay.price.label')}
                    </div>
                    <div className="Overlay__bid_cont">
                      <ValueCounter value={buyAt}></ValueCounter>
                    </div>
                  </div>
                </div>
              </div>
              <br></br>
              <div className="Overlay__buttons_container">
                <Popper
                  open={open}
                  anchorEl={anchorRef.current}
                  role={undefined}
                  transition
                  disablePortal
                >
                  {({ TransitionProps, placement }) => (
                    <Grow
                      {...TransitionProps}
                      style={{
                        transformOrigin:
                          placement === 'bottom'
                            ? 'center top'
                            : 'center bottom',
                      }}
                    >
                      <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                          <MenuList autoFocusItem={open} id="mint-fade-menu">
                            <MenuItem
                              onClick={(e) => {
                                handleClose(e)
                                setActiveStep(
                                  (prevActiveStep) => prevActiveStep + 1
                                )
                                handleNext()
                              }}
                              className="bid-fade-menu --cons-option"
                            >
                              {t('BuyLandOverlay.bid.ovr')}
                            </MenuItem>
                            <MenuItem
                              onClick={async (e) => {
                                handleClose(e)
                                if (checkUserLoggedIn() === false) {
                                  return false
                                }
                                setActiveStep(
                                  (prevActiveStep) => prevActiveStep + 1
                                )
                                await buy(window.web3.toWei(buyAt), 'eth')
                                handleNext()
                              }}
                              className="bid-fade-menu"
                            >
                              {t('BuyLandOverlay.bid.eth')}
                            </MenuItem>
                            <MenuItem
                              onClick={async (e) => {
                                handleClose(e)
                                setMetamaskMessage(
                                  t('MetamaskMessage.set.get.ovr.first')
                                )
                                if (checkUserLoggedIn() === false) {
                                  return false
                                }
                                setActiveStep(
                                  (prevActiveStep) => prevActiveStep + 1
                                )
                                await buy(window.web3.toWei(buyAt), 'dai')
                                handleNext()
                              }}
                              className="bid-fade-menu"
                            >
                              {t('BuyLandOverlay.bid.dai')}
                            </MenuItem>
                            <MenuItem
                              onClick={async (e) => {
                                handleClose(e)
                                setMetamaskMessage(
                                  t('MetamaskMessage.set.get.ovr.first')
                                )
                                if (checkUserLoggedIn() === false) {
                                  return false
                                }
                                setActiveStep(
                                  (prevActiveStep) => prevActiveStep + 1
                                )
                                await buy(window.web3.toWei(buyAt), 'usdt')
                                handleNext()
                              }}
                              className="bid-fade-menu"
                            >
                              {t('BuyLandOverlay.bid.usdt')}
                            </MenuItem>
                            <MenuItem
                              onClick={async (e) => {
                                handleClose(e)
                                setMetamaskMessage(
                                  t('MetamaskMessage.set.get.ovr.first')
                                )
                                if (checkUserLoggedIn() === false) {
                                  return false
                                }
                                setActiveStep(
                                  (prevActiveStep) => prevActiveStep + 1
                                )
                                await buy(window.web3.toWei(buyAt), 'usdc')
                                handleNext()
                              }}
                              className="bid-fade-menu"
                            >
                              {t('BuyLandOverlay.bid.usdc')}
                            </MenuItem>
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
                <HexButton
                  hexRef={anchorRef}
                  url="#"
                  text={t('BuyLandOverlay.confirm.buy')}
                  className="--orange"
                  ariaControls={open ? 'mint-fade-menu' : undefined}
                  ariaHaspopup="true"
                  onClick={handleClick}
                ></HexButton>
                <HexButton
                  url="#"
                  text={t('Generic.cancel.label')}
                  className="--orange-light"
                  onClick={setDeactiveOverlay}
                ></HexButton>
              </div>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="Overlay__body_cont">
            <div className="Overlay__upper">
              <div className="Overlay__title">
                {t('BuyLandOverlay.buy.land')}
              </div>
              <div className="Overlay__land_title">
                {props.land.name.sentence}
              </div>
              <div className="Overlay__land_hex">{props.land.location}</div>
            </div>
            <div className="Overlay__lower">
              <div className="Overlay__bid_container">
                <div className="Overlay__minimum_bid">
                  <div className="Overlay__bid_title">
                    {t('BuyLandOverlay.price.label')}
                  </div>
                  <div className="Overlay__bid_cont">
                    <ValueCounter value={buyAt}></ValueCounter>
                  </div>
                </div>
              </div>
              <div className="Overlay__message__container">
                <span>{metamaskMessage}</span>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="Overlay__body_cont">
            <div className="Overlay__upper">
              <div className="Overlay__congrat_title">
                <span>{t('Generic.congrats.label')}</span>
                <br></br>
                {t('BuyLandOverlay.requested.buy')}
              </div>
              <div className="Overlay__land_title">
                {props.land.name.sentence}
              </div>
              <div className="Overlay__land_hex">{props.land.location}</div>
            </div>
            <div className="Overlay__lower">
              <div className="Overlay__bid_container">
                <div className="Overlay__current_bid">
                  <div className="Overlay__bid_title">
                    {t('BuyLandOverlay.price.label')}
                  </div>
                  <div className="Overlay__bid_cont">
                    <ValueCounter value={buyAt}></ValueCounter>
                  </div>
                </div>
              </div>
              <div className="Overlay__close-button_container">
                <HexButton
                  url="#"
                  text={t('Generic.close.label')}
                  className="--orange-light"
                  onClick={setDeactiveOverlay}
                ></HexButton>
              </div>
            </div>
          </div>
        )
      default:
        return 'Unknown step'
    }
  }

  if (!showOverlay) return null

  return (
    <div className={`OverlayContainer ${classShowOverlay ? '--js-show' : ''}`}>
      <div className="RightOverlay__backpanel"> </div>
      <div
        key="sell-overlay-"
        to={props.url}
        className={`RightOverlay BuyLandOverlay NormalInputs ${
          props.className ? props.className : ''
        } --activeStep-${activeStep}`}
      >
        <div className="Overlay__cont">
          <div
            className="Icon Overlay__close_button"
            onClick={setDeactiveOverlay}
          >
            <svg
              width="30px"
              height="30px"
              viewBox="0 0 30 30"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g
                id="Dashboards"
                stroke="none"
                strokeWidth="1"
                fill="none"
                fillRule="evenodd"
                fillOpacity="0"
              >
                <g
                  id="Biddign-Single-Auction"
                  transform="translate(-398.000000, -298.000000)"
                  fill="#c0c1c0"
                  fillRule="nonzero"
                >
                  <path
                    d="M413,298 C404.715729,298 398,304.715729 398,313 C398,321.284271 404.715729,328 413,328 C421.284271,328 428,321.284271 428,313 C427.989405,304.720121 421.279879,298.010595 413,298 Z M417.369533,315.697384 C417.829203,316.159016 417.829203,316.90686 417.369533,317.368492 C416.90929,317.82955 416.163695,317.82955 415.703452,317.368492 L413,314.656882 L410.296548,317.368492 C409.836305,317.82955 409.09071,317.82955 408.630467,317.368492 C408.170797,316.90686 408.170797,316.159016 408.630467,315.697384 L411.333919,312.985774 L408.630467,310.274164 C408.197665,309.808287 408.210436,309.082301 408.659354,308.632029 C409.108271,308.181756 409.832073,308.168947 410.296548,308.603055 L413,311.314665 L415.703452,308.603055 C416.167927,308.168947 416.891729,308.181756 417.340646,308.632029 C417.789564,309.082301 417.802335,309.808287 417.369533,310.274164 L414.666081,312.985774 L417.369533,315.697384 Z"
                    id="Shape"
                  ></path>
                </g>
              </g>
            </svg>
          </div>
          {getStepContent(activeStep)}
        </div>
      </div>
    </div>
  )
}

BuyLandOverlay.propTypes = {
  props: PropTypes.object,
  reloadLandStatefromApi: PropTypes.func,
  userProvider: PropTypes.object,
  web3Provider: PropTypes.object,
  land: PropTypes.object,
  className: PropTypes.string,
  url: PropTypes.string,
}

export default withUserContext(withWeb3Context(BuyLandOverlay))
