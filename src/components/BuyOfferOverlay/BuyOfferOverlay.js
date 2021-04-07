import React, { useState, useEffect, useContext } from 'react'
import TextField from '@material-ui/core/TextField'
import { withUserContext } from 'context/UserContext'
import { withWeb3Context } from 'context/Web3Context'
import ValueCounter from '../ValueCounter/ValueCounter'
import HexButton from '../HexButton/HexButton'
import config from 'lib/config'
import { warningNotification, dangerNotification } from 'lib/notifications'
import PropTypes from 'prop-types'

import MomentUtils from '@date-io/moment'
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers'

import MenuItem from '@material-ui/core/MenuItem'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import MenuList from '@material-ui/core/MenuList'
import { useTranslation } from 'react-i18next'

import { NewMapContext } from 'context/NewMapContext'

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

const BuyOfferOverlay = (props) => {
  const { t, i18n } = useTranslation()
  const [mapState, setMapState, actions] = useContext(NewMapContext)
  const { activeBuyOfferOverlay } = mapState
  const { changeActiveBuyOfferOverlay } = actions

  const { approveOvrTokens, participateBuyOffer } = props.web3Provider.actions
  const {
    lastTransaction,
    ovr,
    dai,
    tether,
    usdc,
    ico,
    setupComplete,
  } = props.web3Provider.state
  const { hexId } = props.land
  const { marketStatus } = props.land

  const [bidValid, setBidValid] = useState(false)
  const [proposedValue, setProposedValue] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [expirationDate, setExpirationDate] = useState(tomorrow)
  const [metamaskMessage, setMetamaskMessage] = useState(
    t('MetamaskMessage.set.waiting')
  )
  const [solidityExpirationDate, setSolidityExpirationDate] = useState(0)
  const [showOverlay, setShowOverlay] = useState(false)
  const [classShowOverlay, setClassShowOverlay] = useState(false)

  const anchorRef = React.useRef(null)
  const [open, setOpen] = React.useState(false)

  function setDeactiveOverlay(e) {
    e.preventDefault()
    changeActiveBuyOfferOverlay(false)
    // Bring the step at 0
    setTimeout(() => {
      setOpen(false)
      setActiveStep(0)
      setProposedValue('')
    }, 500)
  }

  // Listener for fadein and fadeout animation of overlay
  useEffect(() => {
    if (activeBuyOfferOverlay) {
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
  }, [activeBuyOfferOverlay])

  const setNextBidSelectedLand = async () => {
    if (!setupComplete || !ico || !ovr) {
      return false
    }
  }

  // Init helpers web3
  useEffect(() => {
    if (setupComplete) setNextBidSelectedLand()
  }, [setupComplete, ico, ovr, hexId, marketStatus])

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

  // Update bid value in state
  const updateProposedValue = (val) => {
    if (val != '') {
      setBidValid(true)
    } else {
      setBidValid(false)
    }
    setProposedValue(val)
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

  const participateInAuction = async (type) => {
    if (!checkUserLoggedIn()) return
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
    try {
      const now = Math.trunc(Date.now() / 1000)
      if (now >= solidityExpirationDate) {
        warningNotification(
          t('Warining.date.error'),
          t('Warning.future.notify')
        )
        setActiveStep(0)
        return
      }
      switch (type) {
        case 'ovr':
          setMetamaskMessage(t('MetamaskMessage.set.approve.ovr'))
          await approveOvrTokens(true, ovr)
          setMetamaskMessage(t('MetamaskMessage.set.buy.ovr'))
          await participateBuyOffer(
            4,
            proposedValue,
            solidityExpirationDate,
            hexId
          )
          break
        case 'eth':
          setMetamaskMessage(t('MetamaskMessage.set.buy.eth'))
          await participateBuyOffer(
            0,
            proposedValue,
            solidityExpirationDate,
            hexId
          )
          break
        case 'usdt':
          setMetamaskMessage(t('MetamaskMessage.set.approve.usdt'))
          await approveOvrTokens(true, tether)
          setMetamaskMessage(t('MetamaskMessage.set.buy.usct'))
          await participateBuyOffer(
            2,
            proposedValue,
            solidityExpirationDate,
            hexId
          )
          break
        case 'usdc':
          setMetamaskMessage(t('MetamaskMessage.set.approve.usdc'))
          await approveOvrTokens(true, usdc)
          setMetamaskMessage(t('MetamaskMessage.set.buy.usdc'))
          await participateBuyOffer(
            3,
            proposedValue,
            solidityExpirationDate,
            hexId
          )
          break
        case 'dai':
          setMetamaskMessage(t('MetamaskMessage.set.approve.dai'))
          await approveOvrTokens(true, dai)
          setMetamaskMessage(t('MetamaskMessage.set.buy.dai'))
          await participateBuyOffer(
            1,
            proposedValue,
            solidityExpirationDate,
            hexId
          )
          break
      }
    } catch (e) {
      setOpen(false)
      setActiveStep(0)
      return dangerNotification(t('Danger.error.processing.title'), e.message)
    }
    setActiveStep(2)
  }

  function handleDateChange(e) {
    setSolidityExpirationDate(Math.trunc(e / 1000))
    setExpirationDate(e)
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <div className="Overlay__body_cont">
            <div className="Overlay__upper">
              <div className="Overlay__title">
                {t('BuyOfferOverlay.place.offer')}
              </div>
              <div className="Overlay__land_title">
                {props.land.name.sentence}
              </div>
              <div className="Overlay__land_hex">{props.land.location}</div>
            </div>
            <div className="Overlay__lower">
              <div className="Overlay__lower__cont">
                <div className="Overlay__bid_container">
                  <div className="Overlay__current_bid">
                    <div className="Overlay__bid_title">
                      {t('BuyOfferOverlay.current.value')}
                    </div>
                    <div className="Overlay__bid_cont">
                      <ValueCounter value={props.currentBid}></ValueCounter>
                    </div>
                  </div>
                </div>
                <div className="Overlay__input">
                  <TextField
                    id="quantity"
                    label={t('BuyOfferOverlay.buy.at.label')}
                    type="number"
                    value={proposedValue}
                    onChange={(e) => {
                      const propVal = e.target.value
                      if (propVal > 0) updateProposedValue(propVal)
                    }}
                  />
                  <MuiPickersUtilsProvider utils={MomentUtils}>
                    <DateTimePicker
                      variant="inline"
                      format="DD-MM-YYYY HH:mm"
                      margin="normal"
                      id="date-picker-inline"
                      label={t('BuyOfferOverlay.expires.at.label')}
                      value={expirationDate}
                      onChange={handleDateChange}
                    />
                  </MuiPickersUtilsProvider>
                </div>
              </div>
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
                              onClick={() => {
                                participateInAuction('ovr')
                              }}
                              className="bid-fade-menu --cons-option"
                            >
                              {t('BuyOfferOverlay.buy.using.ovr')}
                            </MenuItem>
                            <MenuItem
                              onClick={async () => {
                                participateInAuction('eth')
                              }}
                              className="bid-fade-menu"
                            >
                              {t('BuyOfferOverlay.buy.using.eth')}
                            </MenuItem>
                            <MenuItem
                              onClick={async () => {
                                participateInAuction('dai')
                              }}
                              className="bid-fade-menu"
                            >
                              {t('BuyOfferOverlay.buy.using.dai')}
                            </MenuItem>
                            <MenuItem
                              onClick={async () => {
                                participateInAuction('usdt')
                              }}
                              className="bid-fade-menu"
                            >
                              {t('BuyOfferOverlay.buy.using.usdt')}
                            </MenuItem>
                            <MenuItem
                              onClick={async () => {
                                participateInAuction('usdc')
                              }}
                              className="bid-fade-menu"
                            >
                              {t('BuyOfferOverlay.buy.using.usdc')}
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
                  text={t('BuyOfferOverlay.place.buy')}
                  className={`--orange ${bidValid ? '' : '--disabled'}`}
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
                {t('BuyOfferOverlay.place.offer')}
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
                    {t('BuyOfferOverlay.current.bid')}
                  </div>
                  <div className="Overlay__bid_cont">
                    <ValueCounter value={props.currentBid}></ValueCounter>
                  </div>
                </div>
                <div className="Overlay__arrow">
                  <div className="Icon">
                    <svg
                      width="10px"
                      height="17px"
                      viewBox="0 0 10 17"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g
                        id="Dashboards"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                      >
                        <g
                          id="Biddign-Single-Auction"
                          transform="translate(-792.000000, -469.000000)"
                          fill="#FFFFFF"
                          stroke="#D4CDD9"
                        >
                          <path
                            d="M793.132554,484.641214 C793.210784,484.719949 793.317088,484.764519 793.428175,484.765159 C793.5396,484.7662 793.646532,484.721367 793.723796,484.641214 L800.694533,477.682613 C800.773611,477.604705 800.818124,477.498417 800.818124,477.387507 C800.818124,477.276596 800.773611,477.170308 800.694533,477.0924 L793.723796,470.132323 C793.61943,470.02095 793.462544,469.975232 793.314547,470.013063 C793.16655,470.050895 793.050984,470.16626 793.013086,470.313999 C792.975188,470.461739 793.020987,470.618352 793.132554,470.722535 L799.807671,477.387507 L793.132554,484.051002 C793.053844,484.129106 793.009585,484.23532 793.009585,484.346108 C793.009585,484.456896 793.053844,484.56311 793.132554,484.641214 Z"
                            id="Path"
                          ></path>
                        </g>
                      </g>
                    </svg>
                  </div>
                </div>
                <div className="Overlay__minimum_bid">
                  <div className="Overlay__bid_title">
                    {t('BuyOfferOverlay.your.offer')}
                  </div>
                  <div className="Overlay__bid_cont">
                    <ValueCounter value={proposedValue}></ValueCounter>
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
                {t('BuyOfferOverlay.offer.sent')}
                <div className="Overlay__etherscan_link">
                  <a
                    href={config.apis.etherscan + '/tx/' + lastTransaction}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('BuyOfferOverlay.view.status')}
                  </a>
                </div>
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
                    {t('BuyOfferOverlay.your.offer')}
                  </div>
                  <div className="Overlay__bid_cont">
                    <ValueCounter value={proposedValue}></ValueCounter>
                  </div>
                </div>
              </div>
              <div className="Overlay__close-button_container">
                <HexButton
                  url="#"
                  text="Close"
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
        key="bid-overlay-"
        to={props.url}
        className={`RightOverlay BuyOfferOverlay NormalInputs ${
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

BuyOfferOverlay.propTypes = {
  reloadLandStatefromApi: PropTypes.func,
  userProvider: PropTypes.object,
  mapProvider: PropTypes.object,
  web3Provider: PropTypes.object,
  land: PropTypes.object,
  className: PropTypes.string,
  url: PropTypes.string,
}

export default withUserContext(withWeb3Context(BuyOfferOverlay))
