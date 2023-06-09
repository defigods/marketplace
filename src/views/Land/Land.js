/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-use-before-define */
import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { withUserContext } from 'context/UserContext'
import { withWeb3Context } from 'context/Web3Context'
import ValueCounter from 'components/ValueCounter/ValueCounter'
import TimeCounter from 'components/TimeCounter/TimeCounter'
import HexButton from 'components/HexButton/HexButton'
import BidOverlay from 'components/BidOverlay/BidOverlay'
import MintOverlay from 'components/MintOverlay/MintOverlay'
import SellOverlay from 'components/SellOverlay/SellOverlay'
import BuyOfferOverlay from 'components/BuyOfferOverlay/BuyOfferOverlay'
// import OpenSellOrder from 'components/OpenSellOrder/OpenSellOrder';
import BuyOfferOrder from 'components/BuyOfferOrder/BuyOfferOrder'
import BuyLandOverlay from 'components/BuyLandOverlay/BuyLandOverlay'
import CircularProgress from '@material-ui/core/CircularProgress'
import { warningNotification } from 'lib/notifications'

import { useHistory } from 'react-router-dom'

import {
  getLand,
  sendAuctionCheckClose,
  checkLandOnMerkle,
  updateLandMarketStatusIfHasBeenMinted,
} from 'lib/api'

import { networkError, successNotification } from 'lib/notifications'
import PropTypes from 'prop-types'

import config from 'lib/config'
import { Textfit } from 'react-textfit'
import ActionCable from 'actioncable'
import { Trans, useTranslation } from 'react-i18next'

import _ from 'lodash'
import { checkToken } from 'lib/auth'

import { NewMapContext } from 'context/NewMapContext'

const Land = (props) => {
  let history = useHistory()
  const { t } = useTranslation()
  const { mapState, setMapState, actions } = useContext(NewMapContext)

  const {
    changeHexId,
    changeLandData,
    changeActiveBidOverlay,
    changeActiveMintOverlay,
    changeActiveSellOverlay,
    changeActiveBuyOverlay,
    changeActiveBuyOfferOverlay,
    enableMultipleLandSelection,
    disableSingleView,
    resetHexId,
  } = actions

  const { getOffersToBuyLand, getUSDValueInOvr } = props.web3Provider.actions
  const {
    ovr,
    ico,
    setupComplete,
    ibcoCurrentOvrPrice,
    LightMintV2Signer,
  } = props.web3Provider.state
  const { isLoggedIn } = props.userProvider.state

  const [hexId, setHexId] = useState(mapState)
  const [integerId, setIntegerId] = useState()
  const [value, setValue] = useState(null)
  const [marketStatus, setMarketStatus] = useState(null)
  const [userPerspective, setUserPerspective] = useState(0)
  const [name, setName] = useState({
    sentence: null,
    hex: null,
  })
  const [location, setLocation] = useState(null)
  const [auction, setAuction] = useState(null)
  // const [openSellOrder, setOpenSellOrder] = useState(null);
  const [openBuyOffers, setOpenBuyOffers] = useState([])
  const [mintTxHash, setMintTxHash] = useState(undefined)
  const [isRedeemingLand, setIsRedeemingLand] = useState(false)
  const [isNotValidH3, setIsNotValidH3] = useState(false)
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [isMintable, setIsMintable] = useState(false)
  const [proofInfo, setProofInfo] = useState({})

  // First load
  useEffect(() => {
    const hex_id = props.match.params.id
    changeHexId(hex_id) // Focus map on hex_id
    loadLandStateFromApi(hex_id) // Load data from API
  }, [props.match.params.id])

  // Sockets
  useEffect(() => {
    if (setupComplete && isLoggedIn && hexId === props.match.params.id) {
      if (isLoggedIn && checkToken('userToken')) {
        if (window.landSocket) window.landSocket.unsubscribe() // unsubscribe precedent land
        var cable = ActionCable.createConsumer(config.apis.socket)
        window.landSocket = cable.subscriptions.create(
          { channel: 'LandsChannel', hex_id: hexId },
          {
            received: (data) => {
              loadLandStateFromApi(hexId)
              decentralizedSetup()
            },
            // unsubscribe: () => {
            //   return this.perform('disconnect')
            // },
          }
        )
      } else {
        if (window.landSocket) window.landSocket.unsubscribe()
      }
    }
  }, [setupComplete, isLoggedIn, hexId])

  // On change of decentralized setup, reload values
  useEffect(() => {
    if (setupComplete) decentralizedSetup()
  }, [setupComplete, ico, ovr, hexId, marketStatus])

  useEffect(() => {
    if (marketStatus == null) {
      let val = getUSDValueInOvr(10)
      if (val != null || ibcoCurrentOvrPrice === null) {
        setValue(() => val)
      }
    }
  }, [ibcoCurrentOvrPrice])

  const decentralizedSetup = async () => {
    if (!setupComplete || !ico || !ovr) {
      return false
    }
    getBuyOffers()
    // updateMarketStatusFromSmartContract(hexId);
    // setContractPrice(hexId);
  }

  // Call API function
  async function loadLandStateFromApi(hex_id) {
    return await getLand(hex_id)
      .then((response) => {
        let data = response.data

        if (data.error && data.error == 'h3_not_valid') {
          setIsNotValidH3(true)
        } else {
          setIsNotValidH3(false)
          changeHexId(data.hexId)
          // Update state component
          setHexId(data.hexId)
          setIntegerId(data.intId)
          setName({ sentence: data.sentenceId, hex: data.hexId })
          setLocation(data.address.full)
          setUserPerspective(data.userPerspective)
          setAuction(data.auction)
          setIsUnavailable(data.isUnavailable)
          setMintTxHash(data.mintTxHash)
          // Centralized
          setValue(() => data.value)
          setMarketStatus(data.marketStatus)
          if (data.auction) {
            if (
              data.auction.status === 1 &&
              Date.parse(data.auction.closeAt) < Date.now()
            ) {
              setMarketStatus(10)
            }
          }

          // If you are owner and land has been assigned on merkle, give the possibility to mint land
          if (data.marketStatus === 11 && data.userPerspective == 1) {
            checkLandOnMerkle(data.intId).then((response) => {
              if (!_.isEmpty(response.data)) {
                setIsMintable(true)
                setProofInfo(response.data)
              }
            })
          }

          // Update state for MapContext
          let state = {
            key: data.hexId,
            name: { sentence: data.sentenceId, hex: data.hexId },
            location: data.address.full,
            userPerspective: data.userPerspective,
            openSellOrder: data.openSellOrder,
            auction: data.auction,
            marketStatus: data.marketStatus,
          }

          return changeLandData(state)
        }
      })
      .catch((error) => {
        // Notify user if network error
        console.log(error)
        networkError()
      })
  }

  const updateMarketStatusFromSmartContract = async (hex_id) => {
    // Set 0 for not started, 1 for started and 2 for ended
    const landId = parseInt(hex_id, 16)
    const land = await ico.landsAsync(landId)

    const lastPaymentTimestamp = parseInt(land[3])
    const landOwner = land[0]
    const auctionLandDuration = parseInt(await ico.auctionLandDurationAsync())
    // Check is the land is ended by comparing the timestamp to 24 hours
    const now = Math.trunc(Date.now() / 1000)
    const landContractState = parseInt(land[4])
    const isOnSale = land[8]

    // Checks if the land is on sale also to display the right buy button
    if (isOnSale) {
      return setMarketStatus(4)
    }
    // If 24 hours have passed, consider it sold
    // Checks if you're the owner or not to display the appropriate button
    if (
      landContractState === 1 &&
      now > lastPaymentTimestamp + auctionLandDuration
    ) {
      return setMarketStatus(5) // Render redeem land button
    }

    if (landContractState === 2) {
      if (landOwner === window.web3.eth.defaultAccount) {
        return setMarketStatus(3)
      } else {
        return setMarketStatus(2)
      }
    } else {
      setMarketStatus(landContractState)
    }
  }

  const getBuyOffers = async () => {
    let offers = [
      {
        order_uuid: 'uuid',
        user_uuid: 'user_uuid',
        land_uuid: 'land_uuid',
        nature: 0,
        status: 'status',
        worth: 10,
        created_at: 'created_at',
        expiration_date: 'expiration_date',
      },
    ]
    setOpenBuyOffers(offers)
  }

  const redeemLand = async (e) => {
    console.debug('redeemLand', e)
    e.preventDefault()
    if (isRedeemingLand || Object.keys(proofInfo).length === 0) {
      return
    }

    try {
      setIsRedeemingLand(true)
      sendAuctionCheckClose(hexId)
      await LightMintV2Signer.claim(
        proofInfo.index,
        proofInfo.owner,
        proofInfo.tokenId,
        proofInfo.tokenUri,
        proofInfo.proof
      )
      updateLandMarketStatusIfHasBeenMinted(hexId)
      setIsRedeemingLand(false)
      successNotification(
        t('Success.action.title'),
        t('Success.request.process.desc')
      )
    } catch (error) {
      setIsRedeemingLand(false)
      console.log(error)
    }
  }

  function setActiveBidOverlay(e) {
    if (!isLoggedIn) {
      warningNotification(
        t('Warning.invalid.auth.title'),
        t('Warning.invalid.auth.desc')
      )
      return false
    }
    e.preventDefault()
    changeActiveBidOverlay(true)
  }

  function setActiveMintOverlay(e) {
    console.debug('setActiveMintOverlay')
    if (!isLoggedIn) {
      warningNotification(
        t('Warning.invalid.auth.title'),
        t('Warning.invalid.auth.desc')
      )
      return false
    }
    e.preventDefault()
    changeActiveMintOverlay(true)
  }

  function setActiveSellOverlay(e) {
    e.preventDefault()
    changeActiveSellOverlay(true)
  }

  function setActiveBuyOverlay(e) {
    e.preventDefault()
    changeActiveBuyOverlay(true)
  }

  function setActiveBuyOfferOverlay(e) {
    e.preventDefault()
    changeActiveBuyOfferOverlay(true)
  }

  //
  // Render elements
  //
  function renderTimer() {
    if (marketStatus === 1) {
      return (
        <>
          <h3 className="o-small-title">{t('Land.closes.label')}</h3>
          <TimeCounter date_end={auction ? auction.closeAt : 24}></TimeCounter>
        </>
      )
    } else {
      return <div>&nbsp;</div>
    }
  }

  const handleEtherscan = (e) => {
    e.preventDefault()
    let etherscanLink =
      'https://etherscan.io/token/0x56b80bbee68932a8d739315c79bc7b125341098a?a=' +
      integerId
    window.open(etherscanLink, '_blank')
  }

  function renderVisitOnEtherscan() {
    let rend = <></>
    if (mintTxHash !== undefined && mintTxHash !== '' && mintTxHash !== null) {
      // If land has been minted
      if (marketStatus == 2) {
        rend = (
          <a
            to=""
            href="#"
            className="l-check-on-etherscan"
            onClick={handleEtherscan}
          >
            {t('ActivityTile.view.ether')}
          </a>
        )
      }
      // If land has been assigned but not minted
      if (marketStatus == 11) {
        rend = (
          <div className="l-light-minted-copy">
            {t('Land.has.been.assigned')}
            <br></br>
            <a
              to=""
              href="#"
              onClick={(e) => {
                e.preventDefault()
                window.open(
                  'https://www.ovr.ai/blog/introducing-light-minting/',
                  '_blank'
                )
              }}
            >
              {t('BuyTokens.read.more')}
            </a>
            .
          </div>
        )
      }
    }
    return rend
  }

  function renderBadge() {
    let badge = <div>&nbsp;</div>

    switch (marketStatus) {
      case 1:
        badge = (
          <div>
            <h3 className="o-small-title">{t('Land.status.label')}</h3>
            <div className="c-status-badge  --open">{t('Land.open.label')}</div>
          </div>
        )
        break
      case 2:
        badge = (
          <div>
            <h3 className="o-small-title">{t('Land.status.label')}</h3>
            <div className="c-status-badge  --owned">
              {t('Land.owned.label')}
            </div>
          </div>
        )
        break
      case 11:
        badge = (
          <div>
            <h3 className="o-small-title">{t('Land.status.label')}</h3>
            <div className="c-status-badge  --owned">
              {t('Land.owned.label')}
            </div>
          </div>
        )
        break
      default:
        badge = <div>&nbsp;</div>
    }

    switch (userPerspective) {
      case 1:
        badge = (
          <div>
            <h3 className="o-small-title">{t('Land.status.label')}</h3>
            <div className="c-status-badge --bestbid">
              {t('Land.owner.label')}
            </div>
          </div>
        )
        break
      case 2:
        badge = (
          <div>
            <h3 className="o-small-title">{t('Land.status.label')}</h3>
            <div className="c-status-badge  --bestbid">
              {t('Land.best.bid')}
            </div>
          </div>
        )
        break
      case 3:
        badge = (
          <div>
            <h3 className="o-small-title">{t('Land.status.label')}</h3>
            <div className="c-status-badge  --outbidded">
              {t('Land.outbidded.label')}
            </div>
          </div>
        )
        break
      default:
        break
    }

    if (isUnavailable == true) {
      badge = (
        <div>
          <h3 className="o-small-title">{t('Land.status.label')}</h3>
          <div className="c-status-badge  --outbidded">
            {t('Land.unvabilable')}
          </div>
        </div>
      )
    }

    if (marketStatus == 10) {
      badge = (
        <div>
          <h3 className="o-small-title">{t('Land.status.label')}</h3>
          <div className="c-status-badge  --open">
            {t('Land.closing')} <CircularProgress />
          </div>
        </div>
      )
    }

    return badge
  }

  function renderOverlayButton() {
    let button = <div>&nbsp;</div>
    switch (marketStatus) {
      case 0:
        if (isUnavailable == false) {
          button = (
            <HexButton
              url="/"
              text={t('Land.init.auction')}
              className="--blue"
              onClick={(e) => setActiveMintOverlay(e)} // open drawer
            />
          )
        } else {
          button = (
            <HexButton
              url={`mailto:info@ovr.ai?subject=Interested in ${hexId}`}
              target="_blank"
              text={t('Generic.contactus.interested')}
              className="--blue"
            />
          )
        }
        break
      case 1:
        button = (
          <HexButton
            url="/"
            text={t('Land.place.bid')}
            className="--purple"
            onClick={(e) => setActiveBidOverlay(e)}
          />
        )
        break
      case 10:
        button = <div></div>
        break
      case 11:
        // If land has been assigned, check if you are owner

        if (userPerspective == 1) {
          if (isMintable === true) {
            button = (
              <HexButton
                url="/"
                text={t('Land.redeem.land')}
                className="--purple"
                onClick={(e) => redeemLand(e)}
              />
            )
          } else {
            button = (
              <div className="l-light-minted-copy">
                {t('Merkle.waiting.update')}
              </div>
            )
          }
        }

        break
      // case 2:
      // 	button = <></>;
      // 	if (userPerspective == 0) {
      // 		button = (
      // 			<HexButton
      // 				url="/"
      // 				text={t('Land.buy.offer')}
      // 				className="--blue"
      // 				onClick={(e) => setActiveBuyOfferOverlay(e)}
      // 			></HexButton>
      // 		);
      // 	} else if (userPerspective == 1) {
      // 		button = (
      // 			<HexButton url="/" text={t('Land.sell.land')} className="--purple --disabled" onClick={(e) => setActiveSellOverlay(e)}></HexButton>
      // 		);
      // 	}

      // 	break;
      // case 3:
      // 	button = (
      // 		<HexButton url="/" text={t('Land.sell.land')} className="--purple" onClick={(e) => setActiveSellOverlay(e)}></HexButton>
      // 	);
      // 	break;
      // case 4:
      // 	button = (
      // 		<HexButton url="/" text={t('Land.buy.now')} className="--purple" onClick={(e) => setActiveBuyOverlay(e)}></HexButton>
      // 	);
      // 	break;
      default:
        button = <div>&nbsp;</div>
        break
    }

    return button
  }

  // Sets the price displayed below the map
  const setContractPrice = async (hex_id) => {
    const landId = parseInt(hex_id, 16)
    const land = await ico.landsAsync(landId)
    let currentBid = String(window.web3.fromWei(land[2]))
    if (currentBid == 0) {
      currentBid = String(window.web3.fromWei(await ico.initialLandBidAsync()))
    }
    setValue(currentBid)
  }

  const LandPrice = ({ price }) => {
    const label =
      marketStatus === 2 ? t('Land.closing.price') : t('Land.price.label')

    const thePrice = marketStatus === null ? null : price

    if (isLoggedIn) {
      return (
        <>
          <h3 className="o-small-title">{label}</h3>
          <ValueCounter value={thePrice}></ValueCounter>
        </>
      )
    } else return null
  }

  const handleMultipleLandSelectionClick = () => {
    resetHexId()
    resetMultipleLandSelectionList()
    disableSingleView()
    enableMultipleLandSelection()
  }

  function renderBidHistory() {
    if (auction === null || auction.bidHistory.length === 0) {
      return (
        <div className="o-container">
          <div className="Title__container">
            <h3 className="o-small-title"></h3>
          </div>
          <div className="c-dialog --centered">
            {!isUnavailable ? (
              <>
                <div className="c-dialog-main-title">
                  {t('Land.be.the.one')}{' '}
                  <span role="img" aria-label="fire-emoji">
                    🔥
                  </span>
                </div>
                <div className="c-dialog-sub-title">
                  <Trans i18nKey="Land.no.active.auction">
                    The land has no active Auction at the moment. <br></br>Click
                    on "Init Auction" and be the one to own it.
                  </Trans>
                </div>
              </>
            ) : (
              <>
                <div className="c-dialog-main-title"></div>
                <div className="c-dialog-sub-title">
                  {t('Lands.not.available.liquidity.mining')}{' '}
                </div>
              </>
            )}
          </div>
        </div>
      )
    } else {
      return (
        <>
          <div className="o-container">
            <div className="Title__container">
              <h3 className="o-small-title">{t('Land.bid.history')}</h3>
            </div>
            <div className="Table__container">
              <table className="Table">
                <thead>
                  <tr>
                    <th>{t('Land.price.label')}</th>
                    <th>{t('Land.when.label')}</th>
                    <th>{t('Land.from.label')}</th>
                  </tr>
                </thead>
                <tbody>
                  {auction.bidHistory.map((bid) => (
                    <tr key={bid.when} className="Table__line">
                      <td>
                        <ValueCounter value={bid.worth}></ValueCounter>{' '}
                      </td>
                      <td>
                        <TimeCounter date_end={bid.when}></TimeCounter>
                      </td>
                      <td>{bid.from}</td>
                      {bid.status === '-99' && (
                        <td>
                          <div className="c-status-badge  --outbidded">
                            FAILED
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )
    }
  }

  function renderActiveOpenOrders() {
    let custom_return = <></>
    let renderOpenSell = <></>
    let renerOpenBuyOffers = <></>
    const displayBuyOffers = true //marketStatus === 2
    const displaySells = true //marketStatus === 3

    // If there are Buy Offers
    if (openBuyOffers.length > 0) {
      // If the land is owned, is not yours and is not on sale show the buy offer option
      if (displayBuyOffers) {
        renerOpenBuyOffers = openBuyOffers.map((offer) => (
          <BuyOfferOrder
            key={offer.id}
            offer={offer}
            isOwner={true}
            userPerspective={userPerspective}
            userProvider={this.props.userProvider}
            web3Provide={this.props.web3Provider}
          ></BuyOfferOrder>
        ))
        // Else show the offers for the seller to accept or decline them
      } else if (displaySells) {
        renderOpenSell = openBuyOffers.map((offer) => (
          <BuyOfferOrder
            key={offer.id}
            offer={offer}
            isOwner={false}
            userPerspective={userPerspective}
            userProvider={this.props.userProvider}
            web3Provide={this.props.web3Provider}
          ></BuyOfferOrder>
        ))
      }
    }

    if (displaySells || displayBuyOffers) {
      custom_return = (
        <div className="Land__section">
          <div className="o-container">
            <div className="Title__container">
              {' '}
              <h3 className="o-small-title">Open Orders</h3>
            </div>
            <div className="Body__container">
              {renderOpenSell}
              {renerOpenBuyOffers}
            </div>
          </div>
        </div>
      )
    }

    return custom_return
  }

  function renderLand() {
    let custom_return
    if (isNotValidH3 == false) {
      custom_return = (
        <>
          <div className="Land">
            <BidOverlay
              currentBid={value}
              land={{
                hexId: hexId,
                marketStatus: marketStatus,
                name: name,
                location: location,
              }}
              auction={auction}
            ></BidOverlay>
            <MintOverlay
              currentBid={value}
              land={{
                hexId: hexId,
                marketStatus: marketStatus,
                name: name,
                location: location,
              }}
            ></MintOverlay>
            <SellOverlay
              currentBid={value}
              land={{
                hexId: hexId,
                marketStatus: marketStatus,
                name: name,
                location: location,
              }}
            ></SellOverlay>
            <BuyOfferOverlay
              currentBid={value}
              land={{
                hexId: hexId,
                marketStatus: marketStatus,
                name: name,
                location: location,
              }}
            ></BuyOfferOverlay>
            <BuyLandOverlay
              currentBid={value}
              land={{
                hexId: hexId,
                marketStatus: marketStatus,
                name: name,
                location: location,
              }}
            ></BuyLandOverlay>

            <div className="o-container">
              <div className="Land__heading__1">
                <h2>
                  <span className="--nft-id">NFT ID: {integerId}</span>
                  <Textfit mode="single" max={25}>
                    {name.sentence}
                  </Textfit>
                </h2>
                <div className="Land__location">{location}</div>
              </div>
              <div className="Land__heading__2">
                <div className="o-fourth">
                  <LandPrice price={value} />
                </div>
                <div className="o-fourth">{renderTimer()}</div>
                <div className="o-fourth">{renderBadge()}</div>
                <div className="o-fourth">
                  {renderVisitOnEtherscan()}
                  {renderOverlayButton()}
                </div>
              </div>
            </div>
            {/*  */}
            <div className="Land__section">{renderBidHistory()}</div>
          </div>
        </>
      )
    } else {
      custom_return = (
        <div className="Land">
          <div className="o-container">
            <div className="c-dialog --centered --not-found">
              <h1>404</h1>
              <div className="c-dialog-main-title">Land not found</div>
              <div className="c-dialog-sub-title">
                The requested land name was not found. <br></br>Click anywhere
                in the map or go to "Marketplace" and start from there.
              </div>
            </div>
          </div>
        </div>
      )
    }
    return custom_return
  }

  return renderLand()
}

Land.propTypes = {
  match: PropTypes.object,
  reloadLandStatefromApi: PropTypes.func,
  userProvider: PropTypes.object,
  mapProvider: PropTypes.object,
  web3Provider: PropTypes.object,
  land: PropTypes.object,
  className: PropTypes.string,
  url: PropTypes.string,
}

export default withWeb3Context(withUserContext(Land))
