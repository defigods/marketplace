import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import ValueCounter from '../../components/ValueCounter/ValueCounter'
import HexButton from '../../components/HexButton/HexButton'
import TermsAndConditionsOverlay from '../../components/TermsAndConditionsOverlay/TermsAndConditionsOverlay'
import { Web3Context } from '../../context/Web3Context'
import { UserContext } from '../../context/UserContext'
import {
  warningNotification,
  successNotification,
} from '../../lib/notifications'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import CircularProgress from '@material-ui/core/CircularProgress'

import { ethers, BigNumber, utils } from 'ethers'
import bn from 'bignumber.js'

import config from '../../lib/config'
import { useHistory, Link } from 'react-router-dom'

import CurrencyTextField from '@unicef/material-ui-currency-textfield'
import TextField from '@material-ui/core/TextField'

import { getCurrentLocale } from '../../i18n'

import Tooltip from '@material-ui/core/Tooltip'
import Help from '@material-ui/icons/Help'

import { getCachedCirculatingSupply } from '../../lib/api'
import { dataX, dataY } from './ibcoChartData'
import { Chart } from 'chart.js'
const mantissa = new bn(1e18)
let ctx
let scatterChart
let chartData
let gradientStroke

let isMobile = window.innerWidth < 860

function PublicSale() {
  const { t, i18n } = useTranslation()
  const [tab, setTab] = React.useState('buy')
  const [transactionValue, setTransactionValue] = React.useState(0.0)
  const [
    transactionValueExtimate,
    setTransactionValueExtimate,
  ] = React.useState(0.0)
  const [
    transactionValueDescription,
    setTransactionValueDescription,
  ] = React.useState(t('IBCO.exchange.buy', { OVRNumber: '0', DAINumber: '0' }))
  const [transactionValueValid, setTransactionValueValid] = React.useState(
    false
  )

  let history = useHistory()
  const web3Context = useContext(Web3Context)
  const userContext = useContext(UserContext)
  const { isLoggedIn: userAuthenticated } = userContext.state

  const [ibcoPendingTransactions, setIbcoPendingTransactions] = React.useState(
    []
  )
  const [ibcoMyTransactions, setIbcoMyTransactions] = React.useState([])
  const [ibcoCurveHistory, setIbcoCurveHistory] = React.useState([])
  const [ibcoAreTermsAccepted, setIbcoAreTermsAccepted] = React.useState(false)
  const [ibcoIsKYCPassed, setIbcoIsKYCPassed] = React.useState(false)
  const [ibcoIsReady, setIbcoIsReady] = React.useState(false)
  const [ibcoIsChartReady, setIbcoIsChartReady] = React.useState(false)
  const [ibcoOVRDAIPrice, setIbcoOVRDAIPrice] = React.useState(0.1)
  const [ibcoSlippage, setIbcoSlippage] = React.useState(0.0)
  const [ibcoHasHistoryLoaded, setIbcoHasHistoryLoaded] = React.useState(false)
  const [ibcoCirculatingSupply, setIbcoCirculatingSupply] = React.useState([])
  const [hasMaxSlippageReached, setHasMaxSlippageReached] = React.useState(
    false
  )
  const [hasPointRendered, setHasPointRendered] = React.useState(false)
  const [shakeInput, setShakeInput] = React.useState(false)
  const [
    showTermsAndConditionsOverlay,
    setShowTermsAndConditionsOverlay,
  ] = React.useState(false)
  const [manualClaimBlockID, setManualClaimBlockID] = React.useState('')

  const [activeStep, setActiveStep] = React.useState(0)
  const steps = getSteps()
  const [classShowPanels, setClassShowPanels] = React.useState(false)

  // Check if anything changed from web3context
  React.useEffect(() => {
    setIbcoPendingTransactions(web3Context.state.ibcoPendingTransactions)
    setIbcoMyTransactions(web3Context.state.ibcoMyTransactions)
    setIbcoCurveHistory(web3Context.state.ibcoCurveHistory)
  }, [
    web3Context.state.ibcoPendingTransactions,
    web3Context.state.ibcoMyTransactions,
    web3Context.state.ibcoCurveHistory,
  ])

  // Check if terms condition changed from userstate and kyc passed
  React.useEffect(() => {
    if (userContext.state.user.kycReviewAnswer === 1) {
      setIbcoIsKYCPassed(true)
      // Tutorial Stepper
      if (activeStep < 1) {
        setActiveStep(1)
      }
    }
  }, [userContext.state.user.kycReviewAnswer])

  React.useEffect(() => {
    if (web3Context.state.ibcoLoadedHistory === true) {
      setIbcoHasHistoryLoaded(true)
    } else {
      setIbcoHasHistoryLoaded(false)
    }
  }, [web3Context.state.ibcoLoadedHistory])

  React.useEffect(() => {
    if (Boolean(userContext.state.user.ibcoAcceptedTerms) == true) {
      setIbcoAreTermsAccepted(true)
      // Tutorial Stepper
      if (activeStep < 2) {
        setActiveStep(2)
      }
    } else {
      setIbcoAreTermsAccepted(false)
    }
  }, [
    userContext.state.user.kycReviewAnswer,
    userContext.state.user.ibcoAcceptedTerms,
  ])

  React.useEffect(() => {
    if (web3Context.state.ibcoDAIAllowance > 1000000) {
      // Tutorial Stepper
      if (activeStep < 3) {
        setActiveStep(4)
      }
    }
  }, [web3Context.state.ibcoDAIAllowance])

  React.useEffect(() => {
    if (ibcoIsReady === true && userAuthenticated) {
      setTimeout(() => {
        renderChart()
        setClassShowPanels(true)
      }, 200)
    }
  }, [ibcoIsReady])

  React.useEffect(() => {
    if (web3Context.state) {
      if (web3Context.state.ibcoSetupComplete) {
        if (web3Context.state.ibcoSetupComplete === true) {
          // web3Context.actions.ibcoPoll()
          setIbcoIsReady(true)
          setIbcoOVRDAIPrice(web3Context.state.ibcoCurrentOvrPrice)

          // Render Point on Chart ( and keep updated )
          if (ibcoIsChartReady === true) {
          }
        }
      }
    }
  }, [web3Context])

  React.useEffect(() => {
    prepareIbcoCurveHistory()
    prepareIbcoCurveMyTransactions()
    prepareIbcoMyOpenTransactions()
  }, [
    web3Context.state.ibcoClaims,
    web3Context.state.ibcoOpenBuyOrders,
    web3Context.state.ibcoOpenSellOrders,
  ])

  React.useEffect(() => {
    getCachedCirculatingSupply().then((response) => {
      let data = response.data.circulatingSupply
      setIbcoCirculatingSupply([
        data['actualCirculatingSupplyDecimal'],
        data['globalStakedDecimal'],
        data['mintedByIbcoDecimal'],
        data['totalPreMinted'],
        data['totalSupplyDecimal'],
        data['totalTokensInVestingContractsDecimal'],
      ])
    })
  }, [])

  // Interface helpers
  const handleTabChange = (newValue) => {
    setTab(newValue)
    setTransactionValueValid(false)
    if (newValue === 'sell') {
      setTransactionValue(0.0)
      setTransactionValueExtimate(0.0)
      setIbcoSlippage(0.0)
      setHasMaxSlippageReached(false)
      setTransactionValueDescription(
        t('IBCO.exchange.sell', { OVRNumber: 0, DAINumber: 0 })
      )
    } else {
      setTransactionValue(0.0)
      setTransactionValueExtimate(0.0)
      setIbcoSlippage(0.0)
      setHasMaxSlippageReached(false)
      setTransactionValueDescription(
        t('IBCO.exchange.buy', { OVRNumber: 0, DAINumber: 0 })
      )
    }
  }

  const handleTransactionValueChange = async (transaction) => {
    let balance = 0
    let transactionValue = parseFloat(transaction)
    if (tab === 'sell') {
      balance = parseFloat(
        ethers.utils.formatEther(web3Context.state.ibcoRewardBalance).toString()
      ).toFixed(2)
    } else {
      balance = parseFloat(
        ethers.utils.formatEther(web3Context.state.ibcoDAIBalance).toString()
      ).toFixed(2)
    }

    if (!getCurrentLocale().includes('zh')) {
      if (parseFloat(transactionValue) >= balance) {
        setTransactionValue(balance)
        setShakeInput(true)
        setTransactionValueDescription(t('Warning.no.token.title'))
        setTimeout(() => {
          setShakeInput(false)
        }, 400)
        return false
      } else {
        setTransactionValue(transactionValue)
      }
      if (transactionValue > 0) {
        setTransactionValueValid(true)
      } else {
        // To do allowance limit
        setTransactionValueValid(false)
      }
    } else {
      setTransactionValueValid(true)
      setTransactionValue(transactionValue)
    }

    let slip = 0
    let maxSlip =
      parseFloat(
        ethers.utils
          .formatEther(web3Context.state.ibcoCollateralDAI.slippage)
          .toString()
      ) * 100
    if (tab === 'sell') {
      let ret = await web3Context.actions.calculateCustomSellPrice(
        transactionValue
      )
      slip = await web3Context.actions.calculateCustomSellSlippage(
        transactionValue
      )
      setTransactionValueExtimate(ret)
      setTransactionValueDescription(
        t('IBCO.exchange.sell', { OVRNumber: transactionValue, DAINumber: ret })
      )
    } else {
      let ret = await web3Context.actions.calculateCustomBuyPrice(
        transactionValue
      )
      slip = await web3Context.actions.calculateCustomBuySlippage(
        transactionValue
      )
      setTransactionValueExtimate(ret)
      setTransactionValueDescription(
        t('IBCO.exchange.buy', { OVRNumber: ret, DAINumber: transactionValue })
      )
    }

    // Slippage
    if ((slip * 100).toFixed(2) >= 0) {
      setIbcoSlippage((slip * 100).toFixed(2))
    }
    if ((slip * 100).toFixed(2) >= maxSlip) {
      if (tab === 'buy') {
        // setHasMaxSlippageReached(true);
      }
    } else {
      setHasMaxSlippageReached(false)
    }
  }

  // Buy and Sell handle functions
  const handleApprove = async (val) => {
    let approve = await web3Context.state.ibcoDAISigner.approve(
      config.apis.curveAddress,
      new bn(val).times(mantissa).toFixed(0)
    )
    successNotification(
      t('IBCO.request.process.title'),
      t('IBCO.request.process.desc')
    )
  }

  // Manual claim by block
  const handleChangeManualClaimBlockID = (val) => {
    setManualClaimBlockID(val)
  }

  const handleManualClaimBlockID = async (e) => {
    try {
      let claim = await web3Context.state.ibcoController.claimBuyOrder(
        web3Context.state.address,
        manualClaimBlockID,
        config.apis.DAI
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    } catch (err) {
      console.log('err', err)
    }
  }

  const handleBuyOvr = async (valueToBuy) => {
    // Check approval
    if (web3Context.state.ibcoDAIAllowance < valueToBuy) {
      await handleApprove(1000000000000)
    }
    // Check your balance
    if (
      parseFloat(
        ethers.utils.formatEther(web3Context.state.ibcoDAIBalance).toString()
      ).toFixed(2) < valueToBuy
    ) {
      // console.log('CCC')
      warningNotification(
        t('Warning.no.token.title'),
        t('Warning.no.tokens.desc', { message: 'DAI' })
      )
    } else {
      // Open MetaMask
      // console.log('DDD')
      let open = await web3Context.state.ibcoController.openBuyOrder(
        config.apis.DAI,
        new bn(valueToBuy).times(mantissa).toFixed(0)
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
  }

  const handleSellOvr = async (valueToSell) => {
    // Check your balance
    if (
      parseFloat(
        ethers.utils.formatEther(web3Context.state.ibcoRewardBalance).toString()
      ).toFixed(2) < valueToSell
    ) {
      warningNotification(
        t('Warning.no.token.title'),
        t('Warning.no.ovrtokens.desc', { message: 'OVR' })
      )
    } else {
      // Open MetaMask
      let sell = await web3Context.state.ibcoController.openSellOrder(
        config.apis.DAI,
        new bn(valueToSell).times(mantissa).toFixed(0)
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
  }

  // Claim Sell and Buy functions

  // handles user clicking "Claim Buy Order" button
  const handleClaimBuy = async (e) => {
    // e.preventDefault();
    let batch = e.target.dataset.b
    let batchId = await web3Context.state.ibcoCurveViewer.getCurrentBatchId()
    if (batchId > batch) {
      let claim = await web3Context.state.ibcoController.claimBuyOrder(
        web3Context.state.address,
        batch,
        config.apis.DAI
      )
      // let reward = await web3Context.state.ibcoRewardViewer.balanceOf(
      // 		web3Context.state.address
      // );
      // web3Context.actions.setRewardBalance(reward);
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    } else {
      alert('Please wait one block for batch to mature')
    }
  }

  // handles user clicking "Claim Sell Order" button
  const handleClaimSell = async (e) => {
    let batch = e.target.dataset.b
    let batchId = await web3Context.state.ibcoCurveViewer.getCurrentBatchId()
    if (batchId > batch) {
      let claim = await web3Context.state.ibcoController.claimSellOrder(
        web3Context.state.address,
        batch,
        config.apis.DAI
      )

      // let reward = await web3Context.state.ibcoRewardViewer.balanceOf(
      // 		web3Context.state.address
      // );
      // web3Context.actions.setRewardBalance(reward);
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    } else {
      alert('Please wait one block for batch to mature')
    }
  }

  // Render Helpers for transactions

  function prepareIbcoMyOpenTransactions() {
    let openPending = []
    for (const claim of web3Context.state.ibcoOpenBuyOrders) {
      let nClaim = {
        type: t('IBCO.buy'),
        typeUni: 'buy',
        batchId: claim.batchId,
        amount: 0,
        fee: parseFloat(ethers.utils.formatEther(claim.fee).toString()),
        value: parseFloat(ethers.utils.formatEther(claim.value).toString()),
        transactionHash: claim.transactionHash,
        duplicateBatch: false,
      }
      if (
        claim.buyer.toLowerCase() === web3Context.state.address.toLowerCase()
      ) {
        // If there is another transaction per batch, mark as duplicate
        if (
          openPending.map((o) => o.batchId._hex).includes(claim.batchId._hex)
        ) {
          nClaim.duplicateBatch = true
        }
        // If there is a claimed transaction with same batchId
        if (
          web3Context.state.ibcoMyClaims
            .map((o) => o.batchId._hex)
            .includes(claim.batchId._hex)
        ) {
          // don't push as pending
        } else {
          openPending.push(nClaim)
        }
      }
    }
    for (const claim of web3Context.state.ibcoOpenSellOrders) {
      let nClaim = {
        type: t('IBCO.sell'),
        typeUni: 'sell',
        batchId: claim.batchId,
        amount: parseFloat(ethers.utils.formatEther(claim.amount).toString()),
        fee: 0,
        value: 0,
        transactionHash: claim.transactionHash,
        duplicateBatch: false,
      }
      if (
        claim.seller.toLowerCase() === web3Context.state.address.toLowerCase()
      ) {
        // If there is another transaction per batch, mark as duplicate
        if (
          openPending.map((o) => o.batchId._hex).includes(claim.batchId._hex)
        ) {
          nClaim.duplicateBatch = true
        }
        // If there is a claimed transaction with same batchId
        if (
          web3Context.state.ibcoMyClaims
            .map((o) => o.batchId._hex)
            .includes(claim.batchId._hex)
        ) {
          // don't push as pending
        } else {
          openPending.push(nClaim)
        }
      }
    }
    setIbcoPendingTransactions(openPending)
  }

  function renderClaimButton(trans) {
    if (trans.duplicateBatch === true) {
      return (
        <>
          {t('IBCO.double.claim')}
          <Tooltip
            title={
              <React.Fragment>{t('IBCO.double.claim.tooltip')}</React.Fragment>
            }
            aria-label="info"
            placement="bottom"
          >
            <Help className="Help" />
          </Tooltip>
        </>
      )
    }
    if (trans.typeUni.toLowerCase() === 'sell') {
      return (
        <div
          className="HexButton --orange"
          data-b={trans.batchId}
          onClick={handleClaimSell}
        >
          {t('IBCO.claim.sell')}
        </div>
      )
    }
    if (trans.typeUni.toLowerCase() === 'buy') {
      return (
        <div
          className="HexButton --orange"
          data-b={trans.batchId}
          onClick={handleClaimBuy}
        >
          {t('IBCO.claim.buy')}
        </div>
      )
    }
  }

  function renderIbcoPendingTransactions() {
    if (
      ibcoPendingTransactions === undefined ||
      ibcoPendingTransactions.length == 0
    ) {
      return (
        <div className="o-container">
          <div className="Title__container">
            <h3 className="o-small-title"></h3>
          </div>
          <div className="c-dialog --centered">
            <div className="c-dialog-main-title">
              {ibcoHasHistoryLoaded === false ? (
                <div className="--pulse">Loading...</div>
              ) : (
                t('IBCO.no.transactions')
              )}
            </div>
            <div className="c-dialog-main-title">
              Claim Buy Order by
              <TextField
                type="text"
                className="i-manual-claim"
                placeholder={'BlockID'}
                onChange={(e) => {
                  const blockId = e.target.value
                  handleChangeManualClaimBlockID(blockId)
                }}
              />
              <HexButton
                url="#"
                text="Claim"
                className={`--orange `}
                onClick={() => {
                  handleManualClaimBlockID()
                }}
              ></HexButton>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="Table__container">
          <table className="Table TableFixed">
            <thead>
              <tr>
                <th>{t('IBCO.transaction.status')}</th>
                <th>{t('IBCO.transaction.batchID')}</th>
                <th>{t('IBCO.transaction.type')}</th>
                <th>{t('IBCO.transaction.priceDai')}</th>
                {/* <th>Fee (DAI)</th> */}
                <th>{t('IBCO.transaction.amountOVR')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ibcoPendingTransactions.map((trans) => (
                <tr className="Table__line" key={trans.transactionHash}>
                  <td className="">{renderClaimButton(trans)}</td>
                  <td className="">
                    {/* <a href={`${config.apis.etherscan}tx/${ethers.utils.formatEther(trans.batchId).toString()}`} target="_blank">
											{ethers.utils.formatEther().toString().slice(0,8)}...{ethers.utils.formatEther(trans.batchId).toString().slice(-8)}
										</a> */}
                    {trans.batchId._hex}
                  </td>
                  <td className="">
                    <td className="min">
                      <div className={`c-status-badge  --${trans.typeUni}`}>
                        {trans.type}
                      </div>
                    </td>
                  </td>
                  <td className="">
                    {trans.value == 0 ? (
                      <></>
                    ) : (
                      <ValueCounter
                        value={trans.value}
                        currency="dai"
                      ></ValueCounter>
                    )}
                    {trans.value == 0 ? <>{t('IBCO.after.claim')}</> : <></>}
                  </td>
                  {/* <td className="">
										{trans.fee == 0 ? <></> : <ValueCounter value={trans.fee} currency="dai"></ValueCounter>}
									</td> */}
                  <td className="">
                    {trans.amount == 0 ? (
                      <></>
                    ) : (
                      <ValueCounter
                        value={trans.amount}
                        currency="ovr"
                      ></ValueCounter>
                    )}
                    {trans.amount == 0 ? <>{t('IBCO.after.claim')}</> : <></>}
                  </td>
                  <td>
                    <a
                      href={
                        config.apis.etherscan + 'tx/' + trans.transactionHash
                      }
                      rel="noopener noreferrer"
                      target="_blank"
                      className="HexButton view-on-etherscan-link"
                    >
                      {t('ActivityTile.view.ether')}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  }

  function prepareIbcoCurveHistory() {
    let hClaim = []
    for (const claim of web3Context.state.ibcoClaims) {
      if (claim.type === 'ClaimBuyOrder') {
        let nClaim = {
          type: t('IBCO.buy'),
          typeUni: 'buy',
          batchId: claim.batchId._hex,
          public_address: claim.buyer,
          amount: parseFloat(
            ethers.utils.formatEther(claim.amount).toString()
          ).toFixed(2),
          fee: 0,
          value: 0,
          transactionHash: claim.transactionHash,
        }
        hClaim.push(nClaim)
      } else {
        let nClaim = {
          type: t('IBCO.sell'),
          typeUni: 'sell',
          batchId: claim.batchId._hex,
          public_address: claim.seller,
          amount: 0,
          fee: parseFloat(
            ethers.utils.formatEther(claim.fee).toString()
          ).toFixed(2),
          value: parseFloat(
            ethers.utils.formatEther(claim.value).toString()
          ).toFixed(2),
          transactionHash: claim.transactionHash,
        }
        hClaim.push(nClaim)
      }
    }
    setIbcoCurveHistory(hClaim)
  }

  function prepareIbcoCurveMyTransactions() {
    let myClaim = []
    for (const claim of web3Context.state.ibcoMyClaims) {
      if (claim.type === 'ClaimBuyOrder') {
        let nClaim = {
          type: t('IBCO.buy'),
          typeUni: 'buy',
          batchId: claim.batchId._hex,
          public_address: claim.buyer,
          amount: parseFloat(
            ethers.utils.formatEther(claim.amount).toString()
          ).toFixed(2),
          fee: 0,
          value: 0,
          transactionHash: claim.transactionHash,
        }
        myClaim.push(nClaim)
      } else {
        let nClaim = {
          type: t('IBCO.sell'),
          typeUni: 'sell',
          batchId: claim.batchId._hex,
          public_address: claim.seller,
          amount: 0,
          fee: parseFloat(
            ethers.utils.formatEther(claim.fee).toString()
          ).toFixed(2),
          value: parseFloat(
            ethers.utils.formatEther(claim.value).toString()
          ).toFixed(2),
          transactionHash: claim.transactionHash,
        }
        myClaim.push(nClaim)
      }
    }
    setIbcoMyTransactions(myClaim)
  }

  function renderIbcoCurveHistory() {
    if (ibcoCurveHistory === undefined || ibcoCurveHistory.length == 0) {
      return (
        <div className="o-container">
          <div className="Title__container">
            <h3 className="o-small-title"></h3>
          </div>
          <div className="c-dialog --centered">
            <div className="c-dialog-main-title">
              {ibcoHasHistoryLoaded === false ? (
                <div className="--pulse">Loading...</div>
              ) : (
                t('IBCO.no.transactions')
              )}
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="Table__container">
          <table className="Table">
            <thead>
              <tr>
                <th>{t('IBCO.transaction.batchID')}</th>
                <th>{t('IBCO.transaction.type')}</th>
                <th>{t('IBCO.transaction.publicaddress')}</th>
                <th>{t('IBCO.transaction.priceDai')}</th>
                {/* <th>Fee (DAI)</th> */}
                <th>{t('IBCO.transaction.amountOVR')}</th>
              </tr>
            </thead>
            <tbody>
              {ibcoCurveHistory.map((trans) => (
                <tr className="Table__line" key={trans.transactionHash}>
                  <td className="max --trans">
                    {/* <a href={`${config.apis.etherscan}tx/${ethers.utils.formatEther(trans.batchId).toString()}`} target="_blank">
											{ethers.utils.formatEther().toString().slice(0,8)}...{ethers.utils.formatEther(trans.batchId).toString().slice(-8)}
										</a> */}
                    {trans.batchId}
                  </td>
                  <td className="min">
                    <div className={`c-status-badge  --${trans.typeUni}`}>
                      {trans.type}
                    </div>
                  </td>
                  <td className="min --addr">{trans.public_address}</td>
                  <td className="min">
                    {trans.value == 0 ? (
                      <></>
                    ) : (
                      <ValueCounter
                        value={trans.value}
                        currency="dai"
                      ></ValueCounter>
                    )}
                    {trans.value == 0 ? (
                      <a
                        href={
                          config.apis.etherscan + 'tx/' + trans.transactionHash
                        }
                        rel="noopener noreferrer"
                        target="_blank"
                        className="HexButton view-on-etherscan-link"
                      >
                        {t('ActivityTile.view.ether')}
                      </a>
                    ) : (
                      <></>
                    )}
                  </td>
                  {/* <td className="min">
										{trans.fee == 0 ? <></> : <ValueCounter value={trans.fee} currency="dai"></ValueCounter>}
									</td> */}
                  <td className="min">
                    {trans.amount == 0 ? (
                      <></>
                    ) : (
                      <ValueCounter
                        value={trans.amount}
                        currency="ovr"
                      ></ValueCounter>
                    )}
                    {trans.amount == 0 ? (
                      <a
                        href={
                          config.apis.etherscan + 'tx/' + trans.transactionHash
                        }
                        rel="noopener noreferrer"
                        target="_blank"
                        className="HexButton view-on-etherscan-link"
                      >
                        {t('ActivityTile.view.ether')}
                      </a>
                    ) : (
                      <></>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  }

  function renderIbcoMyTransactions() {
    if (ibcoMyTransactions === undefined || ibcoMyTransactions.length == 0) {
      return (
        <div className="o-container">
          <div className="Title__container">
            <h3 className="o-small-title"></h3>
          </div>
          <div className="c-dialog --centered">
            <div className="c-dialog-main-title">
              {ibcoHasHistoryLoaded === false ? (
                <div className="--pulse">Loading...</div>
              ) : (
                t('IBCO.no.transactions')
              )}
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="Table__container">
          <table className="Table">
            <thead>
              <tr>
                <th>{t('IBCO.transaction.batchID')}</th>
                <th>{t('IBCO.transaction.type')}</th>
                <th>{t('IBCO.transaction.priceDai')}</th>
                {/* <th>Fee (DAI)</th> */}
                <th>{t('IBCO.transaction.amountOVR')}</th>
              </tr>
            </thead>
            <tbody>
              {ibcoMyTransactions.map((trans) => (
                <tr className="Table__line" key={trans.transactionHash}>
                  <td className="max --trans">
                    {/* <a href={`${config.apis.etherscan}tx/${ethers.utils.formatEther(trans.batchId).toString()}`} target="_blank">
											{ethers.utils.formatEther().toString().slice(0,8)}...{ethers.utils.formatEther(trans.batchId).toString().slice(-8)}
										</a> */}
                    {trans.batchId}
                  </td>
                  <td className="min">
                    <div className={`c-status-badge  --${trans.typeUni}`}>
                      {trans.type}
                    </div>
                  </td>
                  <td className="min">
                    {trans.value == 0 ? (
                      <></>
                    ) : (
                      <ValueCounter
                        value={trans.value}
                        currency="dai"
                      ></ValueCounter>
                    )}
                    {trans.value == 0 ? (
                      <a
                        href={
                          config.apis.etherscan + 'tx/' + trans.transactionHash
                        }
                        rel="noopener noreferrer"
                        target="_blank"
                        className="HexButton view-on-etherscan-link"
                      >
                        {t('ActivityTile.view.ether')}
                      </a>
                    ) : (
                      <></>
                    )}
                  </td>
                  {/* <td className="min">
										{trans.fee == 0 ? <></> : <ValueCounter value={trans.fee} currency="dai"></ValueCounter>}
									</td> */}
                  <td className="min">
                    {trans.amount == 0 ? (
                      <></>
                    ) : (
                      <ValueCounter
                        value={trans.amount}
                        currency="ovr"
                      ></ValueCounter>
                    )}
                    {trans.amount == 0 ? (
                      <a
                        href={
                          config.apis.etherscan + 'tx/' + trans.transactionHash
                        }
                        rel="noopener noreferrer"
                        target="_blank"
                        className="HexButton view-on-etherscan-link"
                      >
                        {t('ActivityTile.view.ether')}
                      </a>
                    ) : (
                      <></>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  }

  function toggleTermsAndConditionsOverlay(a) {
    setShowTermsAndConditionsOverlay(a)
  }

  function renderChart() {
    ctx = document.getElementById('myChart')
    var dataXY = []
    var dataOffset = 41
    let dataLength = 570

    if (isMobile) {
      dataLength = 490
      dataOffset = 70
    }

    for (var i = 0; i < dataLength; i++) {
      let dot = { x: dataX[dataOffset + i], y: dataY[dataOffset + i] }
      dataXY.push(dot)
    }

    gradientStroke = ctx.getContext('2d').createLinearGradient(500, 0, 100, 0)
    gradientStroke.addColorStop(0, '#f9b426')
    gradientStroke.addColorStop(1, '#ec663c')

    chartData = {
      datasets: [
        {
          label: 'Bancor Formula',
          data: dataXY,
          backgroundColor: gradientStroke,
          borderColor: '#5d509c',
          borderWidth: 3,
          fill: true,
          borderDash: [0, 0],
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    }

    scatterChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        legend: {
          display: false,
        },
        scaleOverride: true,
        responsive: true,
        scales: {
          xAxes: [
            {
              type: 'linear',
              position: 'bottom',
              scaleLabel: {
                display: true,
                labelString: 'Supply',
              },
              ticks: {
                // Include a dollar sign in the ticks
                beginAtZero: false,
                callback: function (value, index, values) {
                  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                },
              },
            },
          ],
          yAxes: [
            {
              type: 'linear',
              position: 'bottom',
              scaleLabel: {
                display: true,
                labelString: 'Price',
              },
            },
          ],
        },
      },
    })
    renderPointsOnChart()
  }

  function renderPointsOnChart() {
    if (hasPointRendered == false && ibcoOVRDAIPrice > 0.1) {
      var newDataset = {
        data: [
          {
            x: web3Context.state.ibcoOVRSupply,
            y: (1 / ibcoOVRDAIPrice).toFixed(4),
          },
        ],
        backgroundColor: gradientStroke,
        label: 'Buy Price',
        borderColor: '#5d509c',
        pointBackgroundColor: '#5d509c',
        borderWidth: 3,
        intersect: false,
        fill: true,
        borderDash: [0, 0],
        pointRadius: 5,
        pointHoverRadius: 9,
      }
      chartData.datasets.push(newDataset)
      scatterChart.update()
      setHasPointRendered(true)
    }
  }

  function getSteps() {
    return [
      t('IBCO.stepper.first'),
      t('IBCO.stepper.second'),
      t('IBCO.stepper.third'),
      t('IBCO.stepper.fourth'),
    ]
  }

  function renderActionButtonSection() {
    if (ibcoIsKYCPassed !== true) {
      return (
        <div className="--centered-button-holder">
          <HexButton
            url="#"
            text={t('IBCO.verify.toparticipate')}
            className={`--orange --large --kyc-button --only-butt`}
            // ${bidValid ? '' : '--disabled'}
            onClick={() => {
              history.push('/profile')
            }}
          ></HexButton>
        </div>
      )
    }
    if (ibcoAreTermsAccepted !== true) {
      return (
        <div className="--centered-button-holder">
          <HexButton
            url="#"
            text={t('IBCO.accept.toparticipate')}
            className={`--orange --large --kyc-button --only-butt`}
            // ${bidValid ? '' : '--disabled'}
            onClick={() => toggleTermsAndConditionsOverlay(true)}
          ></HexButton>
        </div>
      )
    }

    // If is Buy if is Sell
    if (tab === 'buy') {
      return (
        <div className="i-ibco-input">
          <div>
            {getCurrentLocale().includes('zh') ? (
              <TextField
                type="number"
                className={`${shakeInput ? '--shake' : ''}`}
                placeholder={'0.00'}
                onChange={(e) => {
                  const eventBid = e.target.value
                  handleTransactionValueChange(eventBid)
                }}
              />
            ) : (
              <CurrencyTextField
                variant="outlined"
                currencySymbol="DAI"
                minimumValue={'0'}
                className={`${shakeInput ? '--shake' : ''}`}
                decimalCharacter="."
                digitGroupSeparator=","
                onChange={(event, value) => {
                  if (value > 0) {
                    handleTransactionValueChange(value)
                  }
                }}
              />
            )}

            <div className="--centered-button-holder">
              {hasMaxSlippageReached === true ? (
                <HexButton
                  url="#"
                  text={t('IBCO.max.slippage.reached')}
                  className={`--orange --large --kyc-button --warning`}
                ></HexButton>
              ) : (
                <HexButton
                  url="#"
                  text={
                    activeStep === 2
                      ? t('IBCO.stepper.third')
                      : transactionValueDescription
                  }
                  className={`--orange --large --kyc-button ${
                    transactionValueValid === false && activeStep === 4
                      ? '--disabled'
                      : ''
                  }`}
                  // ${bidValid ? '' : '--disabled'}
                  onClick={() =>
                    activeStep === 2
                      ? handleApprove(1000000000000)
                      : handleBuyOvr(transactionValue)
                  }
                ></HexButton>
              )}
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="i-ibco-input">
          <div>
            {getCurrentLocale().includes('zh') ? (
              <TextField
                type="number"
                className={`${shakeInput ? '--shake' : ''}`}
                placeholder={'0.00'}
                onChange={(e) => {
                  const eventBid = e.target.value
                  handleTransactionValueChange(eventBid)
                }}
              />
            ) : (
              <CurrencyTextField
                variant="outlined"
                currencySymbol="OVR"
                minimumValue={'0'}
                className={`${shakeInput ? '--shake' : ''}`}
                decimalCharacter="."
                digitGroupSeparator=","
                onChange={(event, value) => {
                  if (value > 0) {
                    handleTransactionValueChange(value)
                  }
                }}
              />
            )}
            <div className="--centered-button-holder">
              {hasMaxSlippageReached === true ? (
                <HexButton
                  url="#"
                  text={t('IBCO.max.slippage.reached')}
                  className={`--orange --large --kyc-button --warning`}
                ></HexButton>
              ) : (
                <HexButton
                  url="#"
                  text={transactionValueDescription}
                  className={`--purple --large --kyc-button ${
                    transactionValueValid == false ? '--disabled' : ''
                  }`}
                  // ${bidValid ? '' : '--disabled'}
                  onClick={() => handleSellOvr(transactionValue)}
                ></HexButton>
              )}
            </div>
          </div>
        </div>
      )
    }
  }

  const PublicSaleContentLoginRequired = () => {
    const { t, i18n } = useTranslation()
    return (
      <div className="profile">
        <div className="o-container">
          <div className="c-dialog --centered">
            <div className="c-dialog-main-title">
              {t('PublicSale.login.required.title')}
              <span role="img" aria-label="Cool dude">
                😎
              </span>
            </div>
            <div className="c-dialog-sub-title">
              {t('PublicSale.login.required.desc')}
            </div>
          </div>

          <div className="o-section">
            <div className="o-card --no-pad --card-6">
              <div className="o-row">
                <h3 className="o-card-title">
                  {t('IBCO.cs.some.information')}
                  <Tooltip
                    title={
                      <React.Fragment>
                        {t('IBCO.cs.more.information.tooltip')}
                      </React.Fragment>
                    }
                    aria-label="info"
                    placement="bottom"
                  >
                    <Help className="Help" />
                  </Tooltip>
                </h3>
              </div>
              <div className="o-line --venti"></div>
              <div className="o-row">
                <div className="o-row --circulating-supply">
                  <div className="o-one-label">
                    <div className="o-label">{t('IBCO.cs.pre')}</div>
                    {/* {t('IBCO.buyprice')} */}
                    <div className="o-value">
                      <ValueCounter
                        value={ibcoCirculatingSupply[3]}
                        currency="ovr"
                      ></ValueCounter>
                    </div>
                  </div>
                  <div className="o-one-label">
                    <div className="o-label">{t('IBCO.cs.minted')}</div>{' '}
                    {/* {t('IBCO.buyprice')} */}
                    <div className="o-value">
                      <ValueCounter
                        value={ibcoCirculatingSupply[2]}
                        currency="ovr"
                      ></ValueCounter>
                    </div>
                  </div>
                  <div className="o-one-label">
                    <div className="o-label">{t('IBCO.cs.total')}</div>{' '}
                    {/* {t('IBCO.buyprice')} */}
                    <div className="o-value">
                      <ValueCounter
                        value={ibcoCirculatingSupply[4]}
                        currency="ovr"
                      ></ValueCounter>
                    </div>
                  </div>
                </div>
                <div className="o-row --circulating-supply">
                  <div className="o-one-label">
                    <div className="o-label">{t('IBCO.cs.vesting')}</div>{' '}
                    {/* {t('IBCO.buyprice')} */}
                    <div className="o-value">
                      <ValueCounter
                        value={ibcoCirculatingSupply[5]}
                        currency="ovr"
                      ></ValueCounter>
                    </div>
                  </div>
                  <div className="o-one-label">
                    <div className="o-label">{t('IBCO.cs.staking')}</div>{' '}
                    {/* {t('IBCO.buyprice')} */}
                    <div className="o-value">
                      <ValueCounter
                        value={ibcoCirculatingSupply[1]}
                        currency="ovr"
                      ></ValueCounter>
                    </div>
                  </div>
                  <div className="o-one-label">
                    <div className="o-label"></div>
                    {/* {t('IBCO.buyprice')} */}
                    <div className="o-value"></div>
                  </div>
                </div>
                <div className="o-row --circulating-supply">
                  <div className="o-one-label">
                    <div className="o-label">{t('IBCO.cs.supply')}</div>{' '}
                    {/* {t('IBCO.buyprice')} */}
                    <div className="o-value">
                      <ValueCounter
                        value={ibcoCirculatingSupply[0]}
                        currency="ovr"
                      ></ValueCounter>
                    </div>
                  </div>
                  <div className="o-one-label">
                    <div className="o-label"></div> {/* {t('IBCO.buyprice')} */}
                    <div className="o-value"></div>
                  </div>
                  <div className="o-one-label">
                    <div className="o-label"></div>
                    {/* {t('IBCO.buyprice')} */}
                    <div className="o-value"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!userAuthenticated) {
    return <PublicSaleContentLoginRequired t={t} />
  } else {
    return (
      <div className={`PublicSale ${classShowPanels ? '--js-show' : ''}`}>
        {ibcoIsReady ? (
          <>
            <TermsAndConditionsOverlay
              disableTermsAndConditionsOverlay={() =>
                toggleTermsAndConditionsOverlay(false)
              }
              showOverlay={showTermsAndConditionsOverlay}
            />
            <div className="o-container">
              <div className="--flex">
                <div className="s-f-curve">
                  <div className="o-card --chart-js --card-1">
                    <div className="o-row --chart-header">
                      <div className="o-one-label">
                        <div className="o-label">{t('IBCO.buyprice')}</div>
                        <div className="o-value">
                          <ValueCounter
                            value={(1 / ibcoOVRDAIPrice).toFixed(4)}
                            currency="dai"
                          ></ValueCounter>
                        </div>
                      </div>
                      <div className="o-one-label">
                        <div className="o-label">{t('IBCO.reserve')}</div>
                        <div className="o-value">
                          <ValueCounter
                            value={
                              ibcoIsReady
                                ? parseFloat(
                                    ethers.utils
                                      .formatEther(
                                        web3Context.state.ibcoDAIReserve
                                      )
                                      .toString()
                                  )
                                    .toFixed(2)
                                    .toString()
                                : '0.0'
                            }
                            currency="dai"
                          ></ValueCounter>
                        </div>
                      </div>
                      <div className="o-one-label">
                        <div className="o-label">{t('IBCO.curveissuance')}</div>
                        <div className="o-value">
                          <ValueCounter
                            value={
                              ibcoIsReady
                                ? web3Context.state.ibcoOVRSupply
                                : '0.0'
                            }
                          ></ValueCounter>
                        </div>
                      </div>
                    </div>
                    <div className="o-row">
                      <div
                        className={`chart-js ${
                          ibcoIsChartReady === false ? '--hidd' : ''
                        }`}
                      >
                        <canvas id="myChart"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="s-f-panel">
                  <div className="o-card --card-2">
                    <div className="o-row">
                      <div className="c-transaction-selector_cont">
                        <div
                          className={`c-transaction-selector ${
                            tab == 'buy' ? '--selected' : ''
                          }`}
                          onClick={() => handleTabChange('buy')}
                        >
                          {t('IBCO.buy')}
                        </div>
                        <div
                          className={`c-transaction-selector --second ${
                            tab == 'sell' ? '--selected' : ''
                          }`}
                          onClick={() => {
                            handleTabChange('sell')
                          }}
                        >
                          {t('IBCO.sell')}
                        </div>
                      </div>
                    </div>
                    <div className="o-row o-row__your_wallet">
                      <h3 className="p-section-title">{t('IBCO.ur.wallet')}</h3>
                      <ValueCounter
                        value={
                          ibcoIsReady
                            ? parseFloat(
                                ethers.utils
                                  .formatEther(web3Context.state.ibcoDAIBalance)
                                  .toString()
                              ).toFixed(2)
                            : '0.00'
                        }
                        currency="dai"
                      ></ValueCounter>
                      <ValueCounter
                        value={
                          ibcoIsReady
                            ? parseFloat(
                                ethers.utils
                                  .formatEther(
                                    web3Context.state.ibcoRewardBalance
                                  )
                                  .toString()
                              ).toFixed(2)
                            : '0.00'
                        }
                      ></ValueCounter>
                    </div>
                    <br></br>
                    <div className="o-row">
                      {t('IBCO.allowance')}{' '}
                      {ibcoIsReady
                        ? parseFloat(
                            ethers.utils
                              .formatEther(web3Context.state.ibcoDAIAllowance)
                              .toString()
                          ).toFixed(0)
                        : '0.00'}
                    </div>
                    <div className="o-line"></div>
                    <div className="o-row o-info-row">
                      <div className="o-half">
                        <h3 className="o-info-title">Price</h3>
                      </div>
                      <div className="o-half --values-holder">
                        <ValueCounter value={'1'} currency="dai"></ValueCounter>
                        <span>=</span>
                        <ValueCounter
                          value={ibcoOVRDAIPrice}
                          currency="ovr"
                        ></ValueCounter>
                      </div>
                    </div>
                    <div className="o-row o-info-row">
                      <div className="o-half">
                        <h3 className="o-info-title">
                          {t('IBCO.receive.amount')}
                        </h3>
                      </div>
                      <div className="o-half">
                        {tab === 'buy' ? (
                          <ValueCounter
                            value={transactionValueExtimate}
                            currency="ovr"
                          ></ValueCounter>
                        ) : (
                          <ValueCounter
                            value={transactionValueExtimate}
                            currency="dai"
                          ></ValueCounter>
                        )}
                      </div>
                    </div>
                    <div className="o-row o-info-row">
                      <div className="o-half">
                        <h3 className="o-info-title">
                          {t('IBCO.max.slippage')}
                        </h3>
                      </div>
                      <div className="o-half">25%</div>
                      {/* {(ibcoIsReady) ? <>
										{ibcoSlippage}
									</> : '0.00'} */}
                    </div>
                    <div className="o-row o-field-row">
                      {renderActionButtonSection()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="o-section">
                <div className="o-card --card-3 --card-stepp">
                  <div>
                    <Stepper activeStep={activeStep} alternativeLabel>
                      {steps.map((label, index) => (
                        <Step key={label}>
                          <StepLabel>{label}</StepLabel>
                          {index == 2 && activeStep == 2 ? (
                            <Typography
                              variant="caption"
                              className="small-step-copy"
                            >
                              {t('IBCO.stepper.third.copy')}
                            </Typography>
                          ) : (
                            <></>
                          )}

                          {index == 3 && activeStep == 4 ? (
                            <Typography
                              variant="caption"
                              className="small-step-copy"
                            >
                              {t('IBCO.stepper.fourth.copy')}
                            </Typography>
                          ) : (
                            <></>
                          )}
                        </Step>
                      ))}
                    </Stepper>
                  </div>
                </div>
              </div>
              <div className="o-section">
                <div className="o-card --card-4">
                  <div className="o-row">
                    <h3 className="o-card-title">
                      {t('IBCO.pending.transactions')}
                    </h3>
                  </div>
                  <div className="o-line --venti"></div>
                  <div className="o-row">{renderIbcoPendingTransactions()}</div>
                </div>
              </div>
              <div className="o-section">
                <div className="o-card --card-5">
                  <div className="o-row">
                    <h3 className="o-card-title">
                      {t('IBCO.my.transactions')}
                    </h3>
                  </div>
                  <div className="o-line --venti"></div>
                  <div className="o-row">{renderIbcoMyTransactions()}</div>
                </div>
              </div>
              <div className="o-section">
                <div className="o-card">
                  <div className="o-row">
                    <h3 className="o-card-title">{t('IBCO.curve.history')}</h3>
                  </div>
                  <div className="o-line --venti"></div>
                  <div className="o-row">{renderIbcoCurveHistory()}</div>
                </div>
              </div>
              <div className="o-section">
                <div className="o-card --no-pad --card-6">
                  <div className="o-row">
                    <h3 className="o-card-title">
                      {t('IBCO.cs.more.information')}
                      <Tooltip
                        title={
                          <React.Fragment>
                            {t('IBCO.cs.more.information.tooltip')}
                          </React.Fragment>
                        }
                        aria-label="info"
                        placement="bottom"
                      >
                        <Help className="Help" />
                      </Tooltip>
                    </h3>
                  </div>
                  <div className="o-line --venti"></div>
                  <div className="o-row">
                    <div className="o-row --circulating-supply">
                      <div className="o-one-label">
                        <div className="o-label">{t('IBCO.cs.pre')}</div>
                        {/* {t('IBCO.buyprice')} */}
                        <div className="o-value">
                          <ValueCounter
                            value={ibcoCirculatingSupply[3]}
                            currency="ovr"
                          ></ValueCounter>
                        </div>
                      </div>
                      <div className="o-one-label">
                        <div className="o-label">{t('IBCO.cs.minted')}</div>{' '}
                        {/* {t('IBCO.buyprice')} */}
                        <div className="o-value">
                          <ValueCounter
                            value={ibcoCirculatingSupply[2]}
                            currency="ovr"
                          ></ValueCounter>
                        </div>
                      </div>
                      <div className="o-one-label">
                        <div className="o-label">{t('IBCO.cs.total')}</div>{' '}
                        {/* {t('IBCO.buyprice')} */}
                        <div className="o-value">
                          <ValueCounter
                            value={ibcoCirculatingSupply[4]}
                            currency="ovr"
                          ></ValueCounter>
                        </div>
                      </div>
                    </div>
                    <div className="o-row --circulating-supply">
                      <div className="o-one-label">
                        <div className="o-label">{t('IBCO.cs.vesting')}</div>{' '}
                        {/* {t('IBCO.buyprice')} */}
                        <div className="o-value">
                          <ValueCounter
                            value={ibcoCirculatingSupply[5]}
                            currency="ovr"
                          ></ValueCounter>
                        </div>
                      </div>
                      <div className="o-one-label">
                        <div className="o-label">{t('IBCO.cs.staking')}</div>{' '}
                        {/* {t('IBCO.buyprice')} */}
                        <div className="o-value">
                          <ValueCounter
                            value={ibcoCirculatingSupply[1]}
                            currency="ovr"
                          ></ValueCounter>
                        </div>
                      </div>
                      <div className="o-one-label">
                        <div className="o-label"></div>
                        {/* {t('IBCO.buyprice')} */}
                        <div className="o-value"></div>
                      </div>
                    </div>
                    <div className="o-row --circulating-supply">
                      <div className="o-one-label">
                        <div className="o-label">{t('IBCO.cs.supply')}</div>{' '}
                        {/* {t('IBCO.buyprice')} */}
                        <div className="o-value">
                          <ValueCounter
                            value={ibcoCirculatingSupply[0]}
                            currency="ovr"
                          ></ValueCounter>
                        </div>
                      </div>
                      <div className="o-one-label">
                        <div className="o-label"></div>{' '}
                        {/* {t('IBCO.buyprice')} */}
                        <div className="o-value"></div>
                      </div>
                      <div className="o-one-label">
                        <div className="o-label"></div>
                        {/* {t('IBCO.buyprice')} */}
                        <div className="o-value"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="PublicSale__loading_interface">
              <span className="Loader__cont">
                <CircularProgress />
                <span>Loading</span>
              </span>
            </div>
          </>
        )}
      </div>
    )
  }
}

export default PublicSale
