import React, { useState, useEffect, useContext } from 'react'

import { withUserContext } from 'context/UserContext'
import { withWeb3Context } from 'context/Web3Context'
import HexButton from 'components/HexButton/HexButton'
import ValueCounter from 'components/ValueCounter/ValueCounter'
import {
  warningNotification,
  dangerNotification,
  successNotification,
} from 'lib/notifications'

import { participateMultipleAuctions } from 'lib/api'
import { getLands } from 'lib/api'
import PropTypes from 'prop-types'
import LandCard from 'components/LandCard/LandCard'
import { useTranslation } from 'react-i18next'

import { NewMapContext } from 'context/NewMapContext'

const Lands = (props) => {
  const { t, i18n } = useTranslation()
  const [mapState, setMapState, actions] = useContext(NewMapContext)

  const {
    enableMultipleLandSelection,
    disableMultipleLandSelection,
    resetMultipleLandSelectionList,
  } = actions
  const { multipleLandSelectionList } = mapState
  const { refreshBalanceAndAllowance } = actions

  const [listLands, setListLands] = useState('')
  const [gasProjection, setGasProjection] = useState(0)
  const [listLandsObj, setListLandsObj] = useState([])
  const { getUSDValueInOvr, authorizeOvrExpense } = props.web3Provider.actions
  const { gasLandCost } = props.web3Provider.state
  const [isProcessing, setIsProcessing] = useState(false)

  const userState = props.userProvider.state.user
  const [userBalance, setUserBalance] = useState(0)
  const [userAllowance, setUserAllowance] = useState(0)
  const [userBalanceProjection, setUserBalanceProjection] = useState(0)
  const [userPendingOnBalance, setUserPendingOnBalance] = useState(0)

  // First load
  useEffect(() => {
    enableMultipleLandSelection()
    return () => {
      disableMultipleLandSelection()
    }
  }, [])

  useEffect(() => {
    setUserBalance(userState.balance)
    setUserAllowance(userState.allowance)
    setUserBalanceProjection(userState.balanceProjection)
    setUserPendingOnBalance(userState.pendingOnBalance)
  }, [])

  // On change balances
  useEffect(() => {
    setUserBalance(userState.balance)
    setUserAllowance(userState.allowance)
    setUserBalanceProjection(userState.balanceProjection)
    setUserPendingOnBalance(userState.pendingOnBalance)
  }, [
    userState,
    userState.balance,
    userState.allowance,
    userState.balanceProjection,
    userState.pendingOnBalance,
  ])

  // On Change of list
  useEffect(() => {
    if (multipleLandSelectionList.length > 0) {
      getLands(multipleLandSelectionList.join(','))
        .then((response) => {
          setListLandsObj(response.data.lands)
          setListLands(
            response.data.lands.map((obj) => (
              <LandCard
                key={obj.hexId}
                url="/"
                value={obj.value}
                background_image={`url(${obj.mapTileUrl}`}
                name={{ sentence: obj.sentenceId, hex: obj.hexId }}
                location={obj.address.full}
                date_end={null}
                is_minimal={true}
              ></LandCard>
            ))
          )
        })
        .catch((error) => {
          // console.log(error);
        })
    }
  }, [multipleLandSelectionList])

  useEffect(() => {
    setGasProjection(gasLandCost)
  }, [gasLandCost])

  const renderTotalEstimate = () => {
    let total = 0
    if (listLandsObj) {
      listLandsObj.map((land) => {
        console.log('land', land)
        let value = land.value
        total = total + value
      })
    }
    return <ValueCounter value={total} currency="ovr"></ValueCounter>
  }

  const calculateTotal = () => {
    let total = 0
    if (listLandsObj) {
      listLandsObj.map((land) => {
        console.log('land', land)
        let value =
          land.value < 100
            ? parseFloat(getUSDValueInOvr(10))
            : parseFloat(land.value)
        total = total + value
      })
    }
    total = total + gasLandCost * listLandsObj.length
    return total.toFixed(2)
  }

  const ensureBalanceAndAllowance = async (cost) => {
    let floatCost = parseFloat(cost)
    // Check balance
    if (floatCost > userBalance) {
      warningNotification(
        t('Warning.no.token.title'),
        t('Warning.no.ovrtokens.desc')
      )
      return false
    }
    // Check Allowance
    if (floatCost > userAllowance || userAllowance < 2000) {
      await authorizeOvrExpense('10000000')
      warningNotification(
        t('Auctions.allowance.waiting.title'),
        t('Auctions.allowance.waiting.desc')
      )
    }
    // Ensure balance with projection of others open auctions
    if (userBalanceProjection - cost < 0) {
      warningNotification(
        t('Warning.no.token.title'),
        t('Auctions.total.projection', {
          OVRTotal: userBalance.toFixed(2),
          OVRPending: userPendingOnBalance.toFixed(2),
        }),
        10000
      )
      return false
    }
    return true
  }

  // Helper used to check if the user is logged in
  const checkUserLoggedIn = () => {
    if (!props.userProvider.state.isLoggedIn) {
      warningNotification(
        t('Warning.invalid.auth.title'),
        t('Warning.invalid.auth.desc')
      )
      return false
    }
    return true
  }

  const participateInAuctions = async (type) => {
    setIsProcessing(true)
    // Ensure user is logged in
    if (!checkUserLoggedIn()) return
    // Refresh balance and allowance
    await refreshBalanceAndAllowance()
    // Ensure balance and allowance
    let checkOnBal = await ensureBalanceAndAllowance(calculateTotal())
    if (!checkOnBal) return

    let hexIds = listLandsObj.map((a) => a.hexId)

    // Start centralized auction
    participateMultipleAuctions(hexIds, parseFloat(getUSDValueInOvr(10)))
      .then((response) => {
        console.log(response)
        if (response.data.result === false) {
          dangerNotification(
            t('Danger.error.processing.title'),
            response.data.errors[0].message
          )
        } else {
          setTimeout(() => {
            successNotification(
              t('Generic.congrats.label'),
              t('Auctions.please.patient')
            )
            setIsProcessing(false)
          }, 2000)
          console.log('responseFalse')
          resetMultipleLandSelectionList()
          successNotification(
            t('Generic.congrats.label'),
            t('Success.request.processing')
          )
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  function renderLand() {
    let custom_return
    if (multipleLandSelectionList.length > 0) {
      custom_return = (
        <div className="Lands">
          <div className="o-container">
            <div className="Land__heading__1">
              <h2>{t('Lands.selected.lands')}</h2>
              <div className="Land__location">{t('Lands.click.to.remove')}</div>
            </div>
            <div className="Land__heading__2">
              <div className="o-fourth">&nbsp;</div>
              <div className="o-fourth">
                <h3 className="o-small-title">{t('Lands.selected.label')}</h3>
                <div>{multipleLandSelectionList.length}/15</div>
              </div>
              <div className="o-fourth">&nbsp;</div>
              <div className="o-fourth"></div>
            </div>
          </div>

          <div className="o-container ls-container">
            <div className="ls-land__display">
              <div className="o-land-list__cont">
                <div className="o-land-list">{listLands}</div>
              </div>
            </div>
            <div className="ls-land__total">
              <div className="o-land-list__total__title">
                <h2>{t('Lands.selected.checkout.title')}</h2>
              </div>
              <div className="o-row">
                <span>{t('Lands.number.of')}</span>
                <span className="o-para-value">
                  {multipleLandSelectionList.length}
                </span>
              </div>
              <br />
              <div className="o-row">
                <span>{t('Lands.total.bidding')}</span>
                {renderTotalEstimate()}
              </div>{' '}
              <br />
              <div className="o-row">
                <span>{t('Lands.estimated.gas.expense')}</span>
                <ValueCounter
                  value={(
                    gasProjection * multipleLandSelectionList.length
                  ).toFixed(2)}
                  currency="ovr"
                ></ValueCounter>
              </div>
              <br />
              <br />
              <br />
              <div className="o-row">
                <span>{t('Lands.total.expense')}</span>
                <ValueCounter
                  value={calculateTotal()}
                  currency="ovr"
                ></ValueCounter>
              </div>
              <br />
              <div className="o-row lands__button_holder">
                <HexButton
                  url="#"
                  text={t('Success.order.confirm')}
                  className={`--orange ${!isProcessing ? '' : '--disabled'}`}
                  ariaHaspopup="true"
                  onClick={() => participateInAuctions()}
                ></HexButton>
              </div>
              <br />
            </div>
          </div>
        </div>
      )
    } else {
      custom_return = (
        <div className="Land">
          <div className="o-container">
            <div className="c-dialog --centered --not-found">
              <div className="c-dialog-main-title">
                <h2>{t('Lands.selected.lands')}</h2>
              </div>
              <div className="c-dialog-sub-title">{t('Lands.focus.land')}</div>
            </div>
          </div>
        </div>
      )
    }
    return custom_return
  }

  return renderLand()
}

Lands.propTypes = {
  match: PropTypes.object,
  reloadLandStatefromApi: PropTypes.func,
  userProvider: PropTypes.object,
  mapProvider: PropTypes.object,
  web3Provider: PropTypes.object,
  land: PropTypes.object,
  className: PropTypes.string,
  url: PropTypes.string,
}

export default withWeb3Context(withUserContext(Lands))
