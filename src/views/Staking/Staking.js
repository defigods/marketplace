import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import ValueCounter from '../../components/ValueCounter/ValueCounter'
import HexButton from '../../components/HexButton/HexButton'
import TermsAndConditionsOverlay from '../../components/TermsAndConditionsOverlay/TermsAndConditionsOverlay'
import { Web3Context } from '../../context/Web3Context'
import { UserContext } from '../../context/UserContext'
import { getToken, removeToken, saveToken } from '../../lib/auth'

import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import ToggleButton from '@material-ui/lab/ToggleButton'

import {
  warningNotification,
  successNotification,
} from '../../lib/notifications'
import CircularProgress from '@material-ui/core/CircularProgress'

import { ethers, BigNumber, utils } from 'ethers'
import bn from 'bignumber.js'

import config from '../../lib/config'
import { isPositiveFloat } from '../../lib/config'
import { useHistory, Link } from 'react-router-dom'

import TextField from '@material-ui/core/TextField'

import { getCurrentLocale } from '../../i18n'

import Tooltip from '@material-ui/core/Tooltip'
import Help from '@material-ui/icons/Help'

const mantissa = new bn(1e18)

function Staking() {
  const { t, i18n } = useTranslation()
  const [tab, setTab] = React.useState('staking')

  const [stakingValuesOVR, setStakingValuesOVR] = React.useState([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ]) // 0-staking, 0-rewards, 0-claimed, 3-staking, 3-rewards..
  const [stakingValuesOVRG, setStakingValuesOVRG] = React.useState([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ]) // 0-staking, 0-rewards, 0-claimed, 3-staking, 3-rewards..
  const [stakingValuesOVRG15, setStakingValuesOVRG15] = React.useState([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ]) // 0-staking, 0-rewards, 0-claimed, 3-staking, 3-rewards..
  const [stakingValuesOVRG30, setStakingValuesOVRG30] = React.useState([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ]) // 0-staking, 0-rewards, 0-claimed, 3-staking, 3-rewards..
  const [vestingValues, setVestingValues] = React.useState([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ]) // OVRG-assigned, OVRG-vested, OVRG-claimed, OVRG15-assigned, OVRG15-vested, OVRG15-claimed..

  const [subTab, setSubTab] = React.useState('ovr')
  const [transactionValue, setTransactionValue] = React.useState(0.0)
  const [transactionValueValid, setTransactionValueValid] = React.useState(
    false
  )
  const [lockup, setLockup] = React.useState(0)

  let history = useHistory()
  const web3Context = useContext(Web3Context)
  const userContext = useContext(UserContext)
  const [web3IsReady, setWeb3IsReady] = React.useState(false)
  const { isLoggedIn: userAuthenticated } = userContext.state

  const [ibcoIsKYCPassed, setIbcoIsKYCPassed] = React.useState(false)

  const loadStakingDeposit = async () => {
    if (web3Context.state.VestOVRGViewer) {
      //let depOVRG = await web3Context.state.VestOVRGViewer.deposited(web3Context.state.address);
      //let bnValue=new bn(1).times(mantissa).toFixed(0)
      // no lockup
      let getToClaimRewards = await web3Context.state.StakeOVRViewer.toClaimRewards(
        web3Context.state.address,
        1
      )
      let getToClaimRewards3 = await web3Context.state.StakeOVRViewer.toClaimRewards(
        web3Context.state.address,
        2
      )
      let getToClaimRewards6 = await web3Context.state.StakeOVRViewer.toClaimRewards(
        web3Context.state.address,
        3
      )

      let stakeBalOVR = await web3Context.state.StakeOVRViewer.balances(
        web3Context.state.address,
        1
      )
      let stakeBalOVRHuman = parseFloat(
        ethers.utils.formatEther(stakeBalOVR).toString()
      ).toFixed(2)

      //3 months
      let stakeBalOVR3 = await web3Context.state.StakeOVRViewer.balances(
        web3Context.state.address,
        2
      )
      let stakeBalOVRHuman3 = parseFloat(
        ethers.utils.formatEther(stakeBalOVR3).toString()
      ).toFixed(2)

      //6 months
      let stakeBalOVR6 = await web3Context.state.StakeOVRViewer.balances(
        web3Context.state.address,
        3
      )
      let stakeBalOVRHuman6 = parseFloat(
        ethers.utils.formatEther(stakeBalOVR6).toString()
      ).toFixed(2)

      //CLAIMED rewardSigner
      let stakeCrewOVR = await web3Context.state.StakeOVRViewer.claimedRewards(
        web3Context.state.address,
        1
      )
      let stakeCrewOVRHuman = parseFloat(
        ethers.utils.formatEther(stakeCrewOVR).toString()
      ).toFixed(2)

      // 3months
      let stakeCrewOVR3 = await web3Context.state.StakeOVRViewer.claimedRewards(
        web3Context.state.address,
        2
      )
      let stakeCrewOVRHuman3 = parseFloat(
        ethers.utils.formatEther(stakeCrewOVR3).toString()
      ).toFixed(2)

      // 6 months
      let stakeCrewOVR6 = await web3Context.state.StakeOVRViewer.claimedRewards(
        web3Context.state.address,
        3
      )
      let stakeCrewOVRHuman6 = parseFloat(
        ethers.utils.formatEther(stakeCrewOVR6).toString()
      ).toFixed(2)

      // updated rewards
      let depositDate = await web3Context.state.StakeOVRViewer.depositDates(
        web3Context.state.address,
        1
      )
      let getRewOVR = await web3Context.state.StakeOVRViewer.getAccruedEmission(
        depositDate,
        stakeBalOVR,
        1
      )
      let getRewOVRHuman = (
        parseFloat(ethers.utils.formatEther(getRewOVR[0]).toString()) +
        parseFloat(ethers.utils.formatEther(getToClaimRewards).toString())
      ).toFixed(3)

      depositDate = await web3Context.state.StakeOVRGViewer.depositDates(
        web3Context.state.address,
        1
      )

      // 3 Months
      depositDate = await web3Context.state.StakeOVRViewer.depositDates(
        web3Context.state.address,
        2
      )
      let getRewOVR3 = await web3Context.state.StakeOVRViewer.getAccruedEmission(
        depositDate,
        stakeBalOVR3,
        2
      )
      let getRewOVRHuman3 = (
        parseFloat(ethers.utils.formatEther(getRewOVR3[0]).toString()) +
        parseFloat(ethers.utils.formatEther(getToClaimRewards3).toString())
      ).toFixed(3)
      depositDate = await web3Context.state.StakeOVRGViewer.depositDates(
        web3Context.state.address,
        2
      )

      // 6 months
      depositDate = await web3Context.state.StakeOVRViewer.depositDates(
        web3Context.state.address,
        3
      )
      let getRewOVR6 = await web3Context.state.StakeOVRViewer.getAccruedEmission(
        depositDate,
        stakeBalOVR6,
        3
      )
      let getRewOVRHuman6 = (
        parseFloat(ethers.utils.formatEther(getRewOVR6[0]).toString()) +
        parseFloat(ethers.utils.formatEther(getToClaimRewards6).toString())
      ).toFixed(3)
      depositDate = await web3Context.state.StakeOVRGViewer.depositDates(
        web3Context.state.address,
        3
      )
      console.log('staking values', [
        stakeBalOVRHuman,
        stakeBalOVRHuman3,
        stakeBalOVRHuman6,
        getRewOVRHuman,
        getRewOVRHuman3,
        getRewOVRHuman6,
        stakeCrewOVRHuman,
        stakeCrewOVRHuman3,
        stakeCrewOVRHuman6,
      ])
      setStakingValuesOVR([
        stakeBalOVRHuman,
        stakeBalOVRHuman3,
        stakeBalOVRHuman6,
        getRewOVRHuman,
        getRewOVRHuman3,
        getRewOVRHuman6,
        stakeCrewOVRHuman,
        stakeCrewOVRHuman3,
        stakeCrewOVRHuman6,
      ])
    }
  }

  // On Web3Loaded
  React.useEffect(() => {
    // saveToken('lastVisitedPage', '/staking')

    if (web3Context.state) {
      if (web3Context.state.ibcoSetupComplete) {
        if (web3Context.state.ibcoSetupComplete === true) {
          setWeb3IsReady(true)
        }
      }
    }
  }, [web3Context])

  React.useEffect(() => {
    loadStakingDeposit()
    setInterval(() => {
      loadStakingDeposit()
    }, 30000)
  }, [web3IsReady])

  // Check if terms condition changed from userstate and kyc passed
  React.useEffect(() => {
    if (userContext.state.user.kycReviewAnswer === 1) {
      setIbcoIsKYCPassed(true)
    }
  }, [userContext.state.user.kycReviewAnswer])

  // Interface helpers
  const handleTabChange = (newValue) => {
    setTab(newValue)
    setTransactionValue(0.0)
    setTransactionValueValid(false)
    if (tab === 'vesting') {
      setSubTab('ovr')
    } else {
      setSubTab('ovrg')
    }
  }

  const handleSubTabChange = (newValue) => {
    setSubTab(newValue)
    setTransactionValue(0.0)
    setTransactionValueValid(false)
  }

  const handleTransactionValueChange = async (transaction) => {
    let transactionValue = parseFloat(transaction)
    setTransactionValueValid(true)
    setTransactionValue(transactionValue)
  }

  const handleChangeLockup = (event, newLockup) => {
    setLockup(newLockup)
  }

  // Staking
  const participateStakingDeposit = async (currency) => {
    console.log('participateStakingDeposit', currency)
    console.log('value', transactionValue)
    console.log('lockup', lockup)
    // check on values
    if (!isPositiveFloat(transactionValue)) {
      warningNotification(
        t('Warning.amount.invalid.title'),
        t('Warning.amount.invalid.desc')
      )
      return false
    }
    // convert to BN to do the deposit
    let bnValue = new bn(transactionValue).times(mantissa).toFixed(0)
    let lockup2 = 0
    if (lockup == 0) {
      lockup2 = 1
    }
    if (lockup == 3) {
      lockup2 = 2
    }
    if (lockup == 6) {
      lockup2 = 3
    }

    if (currency === 'ovr') {
      let allowanceOVR = await web3Context.state.ibcoRewardViewer.allowance(
        web3Context.state.address,
        config.apis.stakingOVR
      )
      allowanceOVR = parseFloat(
        ethers.utils.formatEther(allowanceOVR).toString()
      ).toFixed(2)
      if (allowanceOVR < parseFloat(transactionValue)) {
        warningNotification(
          t('Warning.allowance.invalid.title'),
          t('Warning.allowance.invalid.desc')
        )
        return false
      }
      let stakeBalOVR = await web3Context.state.StakeOVRSigner.deposit(
        lockup2,
        bnValue
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
    if (currency === 'ovrg') {
      let allowanceOVRG = await web3Context.state.tokenOVRGViewer.allowance(
        web3Context.state.address,
        config.apis.stakingOVRG
      )
      allowanceOVRG = parseFloat(
        ethers.utils.formatEther(allowanceOVRG).toString()
      ).toFixed(2)
      if (allowanceOVRG < parseFloat(transactionValue)) {
        warningNotification(
          t('Warning.allowance.invalid.title'),
          t('Warning.allowance.invalid.desc')
        )
        return false
      }
      let stakeBalOVRG = await web3Context.state.StakeOVRGSigner.deposit(
        lockup2,
        bnValue
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
    if (currency === 'ovrg15') {
      let allowanceOVRG15 = await web3Context.state.tokenOVRG15Viewer.allowance(
        web3Context.state.address,
        config.apis.stakingOVRG15
      )
      allowanceOVRG15 = parseFloat(
        ethers.utils.formatEther(allowanceOVRG15).toString()
      ).toFixed(2)
      if (allowanceOVRG15 < parseFloat(transactionValue)) {
        warningNotification(
          t('Warning.allowance.invalid.title'),
          t('Warning.allowance.invalid.desc')
        )
        return false
      }
      let stakeBalOVRG15 = await web3Context.state.StakeOVRG15Signer.deposit(
        lockup2,
        bnValue
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
    if (currency === 'ovrg30') {
      let allowanceOVRG30 = await web3Context.state.tokenOVRG30Viewer.allowance(
        web3Context.state.address,
        config.apis.stakingOVRG30
      )
      allowanceOVRG30 = parseFloat(
        ethers.utils.formatEther(allowanceOVRG30).toString()
      ).toFixed(2)
      if (allowanceOVRG30 < parseFloat(transactionValue)) {
        warningNotification(
          t('Warning.allowance.invalid.title'),
          t('Warning.allowance.invalid.desc')
        )
        return false
      }
      let stakeBalOVRG30 = await web3Context.state.StakeOVRG30Signer.deposit(
        lockup2,
        bnValue
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
  }

  const participateStakingClaim = async (kind, currency) => {
    console.log('participateStakingDeposit', { kind, currency })
    console.log('value', transactionValue)
    console.log('lockup', lockup)
    // convert to BN to do the deposit
    let bnValue = new bn(transactionValue).times(mantissa).toFixed(0)
    let lockup2 = 0
    if (lockup == 0) {
      lockup2 = 1
    }
    if (lockup == 3) {
      lockup2 = 2
    }
    if (lockup == 6) {
      lockup2 = 3
    }

    if (kind === 'capital') {
      // check on values
      if (!isPositiveFloat(transactionValue)) {
        warningNotification(
          t('Warning.amount.invalid.title'),
          t('Warning.amount.invalid.desc')
        )
        return false
      }
      if (currency === 'ovr') {
        let stakeCapOVR = await web3Context.state.StakeOVRSigner.makeWithdrawal(
          lockup2,
          bnValue
        )
      }
      if (currency === 'ovrg') {
        let stakeCapOVRG = await web3Context.state.StakeOVRGSigner.makeWithdrawal(
          lockup2,
          bnValue
        )
      }
      if (currency === 'ovrg15') {
        let stakeCapOVRG15 = await web3Context.state.StakeOVRG15Signer.makeWithdrawal(
          lockup2,
          bnValue
        )
      }
      if (currency === 'ovrg30') {
        let stakeCapOVRG30 = await web3Context.state.StakeOVRG30Signer.makeWithdrawal(
          lockup2,
          bnValue
        )
      }
    }
    if (kind === 'stakes') {
      if (currency === 'ovr') {
        let stakeSTKOVR = await web3Context.state.StakeOVRSigner.makeWithdrawalRewards(
          lockup2
        )
      }
      if (currency === 'ovrg') {
        let stakeSTKOVRG = await web3Context.state.StakeOVRGSigner.makeWithdrawalRewards(
          lockup2
        )
      }
      if (currency === 'ovrg15') {
        let stakeSTKOVRG15 = await web3Context.state.StakeOVRG15Signer.makeWithdrawalRewards(
          lockup2
        )
      }
      if (currency === 'ovrg30') {
        let stakeSTKOVRG30 = await web3Context.state.StakeOVRG30Signer.makeWithdrawalRewards(
          lockup2
        )
      }
    }
  }

  // Vesting
  const participateVestingDeposit = async (currency) => {
    console.log('participateVestingDeposit', currency)
    console.log('value', transactionValue)
    console.log('currency', currency)
    // check on values
    if (!isPositiveFloat(transactionValue)) {
      warningNotification(
        t('Warning.amount.invalid.title'),
        t('Warning.amount.invalid.desc')
      )
      return false
    }

    // convert to BN to do the deposit
    let bnValue = new bn(transactionValue).times(mantissa).toFixed(0)
    console.log('valueBN', bnValue)

    if (currency === 'ovrg') {
      // Check Allowance
      let allowanceOVRG = await web3Context.state.tokenOVRGViewer.allowance(
        web3Context.state.address,
        config.apis.VestingOVRG
      )
      allowanceOVRG = parseFloat(
        ethers.utils.formatEther(allowanceOVRG).toString()
      ).toFixed(2)
      console.log('allowanceOVRG', allowanceOVRG)
      if (allowanceOVRG < parseFloat(transactionValue)) {
        warningNotification(
          t('Warning.allowance.invalid.title'),
          t('Warning.allowance.invalid.desc')
        )
        return false
      }
      // Partecipate
      let depositOVRG = await web3Context.state.VestOVRGSigner.deposit(bnValue)
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
    if (currency === 'ovrg15') {
      // Check Allowance
      let allowanceOVRG15 = await web3Context.state.tokenOVRG15Viewer.allowance(
        web3Context.state.address,
        config.apis.VestingOVRG15
      )
      allowanceOVRG15 = parseFloat(
        ethers.utils.formatEther(allowanceOVRG15).toString()
      ).toFixed(2)
      if (allowanceOVRG15 < parseFloat(transactionValue)) {
        warningNotification(
          t('Warning.allowance.invalid.title'),
          t('Warning.allowance.invalid.desc')
        )
        return false
      }
      // Partecipate
      let depositOVRG15 = await web3Context.state.VestOVRG15Signer.deposit(
        bnValue
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
    if (currency === 'ovrg30') {
      // Check Allowance
      let allowanceOVRG30 = await web3Context.state.tokenOVRG30Viewer.allowance(
        web3Context.state.address,
        config.apis.VestingOVRG30
      )
      allowanceOVRG30 = parseFloat(
        ethers.utils.formatEther(allowanceOVRG30).toString()
      ).toFixed(2)
      if (allowanceOVRG30 < parseFloat(transactionValue)) {
        warningNotification(
          t('Warning.allowance.invalid.title'),
          t('Warning.allowance.invalid.desc')
        )
        return false
      }
      // Partecipate
      let depositOVRG30 = await web3Context.state.VestOVRG30Signer.deposit(
        bnValue
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
  }

  const participateVestingClaim = async (currency) => {
    console.log('participateVestingClaim', currency)
    console.log('value', transactionValue)
    console.log('lockup', lockup)

    if (currency === 'ovrg') {
      let claimOVRG = await web3Context.state.VestOVRGSigner.unlockVestedTokens()
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
    if (currency === 'ovrg15') {
      let claimOVRG = await web3Context.state.VestOVRG15Signer.unlockVestedTokens()
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
    if (currency === 'ovrg30') {
      let claimOVRG = await web3Context.state.VestOVRG30Signer.unlockVestedTokens()
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
  }

  const allowanceDeposit = async (currency) => {
    console.log('participateVestingClaim', currency)
    console.log('value', transactionValue)
    console.log('lockup', lockup)
    console.log('Wallet: ', web3Context.state.address)
    let ovrgAddress = await web3Context.state.VestOVRGViewer.ovrg()
    let ovrg = '10000000'
    const howMuchTokens = ethers.utils.parseUnits(ovrg, 18)

    if (currency === 'ovrg') {
      let approve = await web3Context.state.tokenOVRGSigner.approve(
        config.apis.VestingOVRG,
        new bn(ovrg).times(mantissa).toFixed(0)
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
    if (currency === 'ovrg15') {
      let approve = await web3Context.state.tokenOVRG15Signer.approve(
        config.apis.VestingOVRG15,
        new bn(ovrg).times(mantissa).toFixed(0)
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
    if (currency === 'ovrg30') {
      let approve = await web3Context.state.tokenOVRG30Signer.approve(
        config.apis.VestingOVRG30,
        new bn(ovrg).times(mantissa).toFixed(0)
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
  }

  const allowanceStaking = async (currency) => {
    console.log('participateVestingClaim', currency)
    console.log('value', transactionValue)
    console.log('lockup', lockup)
    console.log('Wallet: ', web3Context.state.address)
    let ovrgAddress = await web3Context.state.VestOVRGViewer.ovrg()
    let ovrg = '10000000'
    const howMuchTokens = ethers.utils.parseUnits(ovrg, 18)

    if (currency === 'ovr') {
      let approve = await web3Context.state.ibcoRewardSigner.approve(
        config.apis.stakingOVR,
        new bn(ovrg).times(mantissa).toFixed(0)
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
    if (currency === 'ovrg') {
      let approve = await web3Context.state.OVRGSigner.approve(
        config.apis.stakingOVRG,
        new bn(ovrg).times(mantissa).toFixed(0)
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
    if (currency === 'ovrg15') {
      let approve = await web3Context.state.OVRG15Signer.approve(
        config.apis.stakingOVRG15,
        new bn(ovrg).times(mantissa).toFixed(0)
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
    if (currency === 'ovrg30') {
      let approve = await web3Context.state.OVRG30Signer.approve(
        config.apis.stakingOVRG30,
        new bn(ovrg).times(mantissa).toFixed(0)
      )
      successNotification(
        t('IBCO.request.process.title'),
        t('IBCO.request.process.desc')
      )
    }
  }
  // Example
  const handleApprove = async (val) => {
    //let test = await web3Context.state.vestingOVRGViewer.deposit(100);
    // let approve = await web3Context.state.ibcoDAISigner.approve(
    // 		config.apis.curveAddress,
    // 		new bn(val).times(mantissa).toFixed(0)
    // );
    // successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))
  }

  const renderSubTabVesting = () => {
    if (subTab == 'ovrg') {
      return (
        <>
          <div className="o-row">
            <div className="o-row --value-header">
              <div className="o-one-label">
                <div className="o-label">{t('Vesting.total')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={vestingValues[0]}
                    currency="ovr"
                  ></ValueCounter>
                </div>
              </div>
              <div className="o-one-label">
                <div className="o-label">{t('Vesting.total.vested')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={vestingValues[1]}
                    currency="ovr"
                  ></ValueCounter>
                </div>
              </div>
              <div className="o-one-label">
                <div className="o-label">{t('Vesting.total.claimed')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={vestingValues[2]}
                    currency="ovr"
                  ></ValueCounter>
                </div>
              </div>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row o-flow-root">
              <h3 className="c-section-title">
                {t('Staking.convert', { token: 'OVRG' })}
              </h3>
            </div>
            <div className="i-ibco-input">
              <TextField
                variant="outlined"
                type="number"
                currencySymbol="OVRG"
                minimumValue={'0'}
                decimalCharacter="."
                digitGroupSeparator=","
                onChange={(e) => {
                  handleTransactionValueChange(e.target.value)
                }}
              />
            </div>
            <div className="o-half">
              <HexButton
                url="#"
                text={t('Vesting.allwance', { token: 'OVRG' })}
                className={`--orange --large --kyc-button --only-butt`}
                // ${bidValid ? '' : '--disabled'}
                onClick={() => allowanceDeposit('ovrg')}
              ></HexButton>
            </div>
            <div className="o-half">
              <HexButton
                url="#"
                text={t('Staking.convert', { token: 'OVRG' })}
                className={`--orange --large --kyc-button --only-butt`}
                // ${bidValid ? '' : '--disabled'}
                onClick={() => participateVestingDeposit('ovrg')}
              ></HexButton>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row">
              <h3 className="c-section-title">
                {t('Vesting.claim', { token: 'OVR' })}
              </h3>
            </div>
            <div className="o-row o-flow-root">
              <div className="o-row">
                <HexButton
                  url="#"
                  text={t('Vesting.claim', { token: 'OVR' })}
                  className={`--orange --large --kyc-button --only-butt`}
                  // ${bidValid ? '' : '--disabled'}
                  onClick={() => participateVestingClaim('ovrg')}
                ></HexButton>
              </div>
            </div>
          </div>
        </>
      )
    }
    if (subTab == 'ovrg15') {
      return (
        <>
          <div className="o-row">
            <div className="o-row --value-header">
              <div className="o-one-label">
                <div className="o-label">{t('Vesting.total')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={vestingValues[3]}
                    currency="ovr"
                  ></ValueCounter>
                </div>
              </div>
              <div className="o-one-label">
                <div className="o-label">{t('Vesting.total.vested')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={vestingValues[4]}
                    currency="ovr"
                  ></ValueCounter>
                </div>
              </div>
              <div className="o-one-label">
                <div className="o-label">{t('Vesting.total.claimed')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={vestingValues[5]}
                    currency="ovr"
                  ></ValueCounter>
                </div>
              </div>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row o-flow-root">
              <h3 className="c-section-title">
                {t('Staking.convert', { token: 'OVRG15' })}
              </h3>
            </div>
            <div className="i-ibco-input">
              <TextField
                variant="outlined"
                type="number"
                currencySymbol="OVRG15"
                minimumValue={'0'}
                decimalCharacter="."
                digitGroupSeparator=","
                onChange={(e) => {
                  handleTransactionValueChange(e.target.value)
                }}
              />
            </div>
            <div className="o-half">
              <HexButton
                url="#"
                text={t('Vesting.allwance', { token: 'OVRG15' })}
                className={`--orange --large --kyc-button --only-butt`}
                // ${bidValid ? '' : '--disabled'}
                onClick={() => allowanceDeposit('ovrg15')}
              ></HexButton>
            </div>
            <div className="o-half">
              <HexButton
                url="#"
                text={t('Staking.convert', { token: 'OVRG15' })}
                className={`--orange --large --kyc-button --only-butt`}
                // ${bidValid ? '' : '--disabled'}
                onClick={() => participateVestingDeposit('ovrg15')}
              ></HexButton>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row">
              <h3 className="c-section-title">
                {t('Vesting.claim', { token: 'OVR' })}
              </h3>
            </div>
            <div className="o-row o-flow-root">
              <div className="o-row">
                <HexButton
                  url="#"
                  text={t('Vesting.claim', { token: 'OVR' })}
                  className={`--orange --large --kyc-button --only-butt`}
                  // ${bidValid ? '' : '--disabled'}
                  onClick={() => participateVestingClaim('ovrg15')}
                ></HexButton>
              </div>
            </div>
          </div>
        </>
      )
    }
    if (subTab == 'ovrg30') {
      return (
        <>
          <div className="o-row">
            <div className="o-row --value-header">
              <div className="o-one-label">
                <div className="o-label">{t('Vesting.total')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={vestingValues[6]}
                    currency="ovr"
                  ></ValueCounter>
                </div>
              </div>
              <div className="o-one-label">
                <div className="o-label">{t('Vesting.total.vested')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={vestingValues[7]}
                    currency="ovr"
                  ></ValueCounter>
                </div>
              </div>
              <div className="o-one-label">
                <div className="o-label">{t('Vesting.total.claimed')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={vestingValues[8]}
                    currency="ovr"
                  ></ValueCounter>
                </div>
              </div>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row o-flow-root">
              <h3 className="c-section-title">
                {t('Staking.convert', { token: 'OVRG30' })}
              </h3>
            </div>
            <div className="i-ibco-input">
              <TextField
                variant="outlined"
                type="number"
                currencySymbol="OVRG30"
                minimumValue={'0'}
                decimalCharacter="."
                digitGroupSeparator=","
                onChange={(e) => {
                  handleTransactionValueChange(e.target.value)
                }}
              />
            </div>
            <div className="o-half">
              <HexButton
                url="#"
                text={t('Vesting.allwance', { token: 'OVRG30' })}
                className={`--orange --large --kyc-button --only-butt`}
                // ${bidValid ? '' : '--disabled'}
                onClick={() => allowanceDeposit('ovrg30')}
              ></HexButton>
            </div>
            <div className="o-half">
              <HexButton
                url="#"
                text={t('Staking.convert', { token: 'OVRG30' })}
                className={`--orange --large --kyc-button --only-butt`}
                // ${bidValid ? '' : '--disabled'}
                onClick={() => participateVestingDeposit('ovrg30')}
              ></HexButton>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row">
              <h3 className="c-section-title">
                {t('Vesting.claim', { token: 'OVR' })}
              </h3>
            </div>
            <div className="o-row o-flow-root">
              <div className="o-row">
                <HexButton
                  url="#"
                  text={t('Vesting.claim', { token: 'OVR' })}
                  className={`--orange --large --kyc-button --only-butt`}
                  // ${bidValid ? '' : '--disabled'}
                  onClick={() => participateVestingClaim('ovrg30')}
                ></HexButton>
              </div>
            </div>
          </div>
        </>
      )
    }
  }

  const renderSubTabStaking = () => {
    if (subTab == 'ovr') {
      return (
        <>
          <div className="o-row">
            <div className="o-row --value-header">
              <div className="o-one-label">
                <div className="o-label">{t('Staking.total')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVR[0]}
                    currency="ovr"
                    text={t('Staking.lockup.0')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVR[1]}
                    currency="ovr"
                    text={t('Staking.lockup.3')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVR[2]}
                    currency="ovr"
                    text={t('Staking.lockup.6')}
                  ></ValueCounter>
                </div>
              </div>
              <div className="o-one-label">
                <div className="o-label">{t('Staking.total.rewards')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVR[3]}
                    currency="ovr"
                    text={t('Staking.lockup.0')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVR[4]}
                    currency="ovr"
                    text={t('Staking.lockup.3')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVR[5]}
                    currency="ovr"
                    text={t('Staking.lockup.6')}
                  ></ValueCounter>
                </div>
              </div>
              <div className="o-one-label">
                <div className="o-label">{t('Staking.claimed.rewards')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVR[6]}
                    currency="ovr"
                    text={t('Staking.lockup.0')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVR[7]}
                    currency="ovr"
                    text={t('Staking.lockup.3')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVR[8]}
                    currency="ovr"
                    text={t('Staking.lockup.6')}
                  ></ValueCounter>
                </div>
              </div>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row">
              <h3 className="c-section-title">
                {t('Staking.deposit', { token: 'OVR' })}
              </h3>
            </div>
            <div className="o-row">
              <b>{t('Staking.lockup')}:</b>
              <ToggleButtonGroup
                size="small"
                value={lockup}
                exclusive
                onChange={handleChangeLockup}
              >
                <ToggleButton value={0}>{t('Staking.lockup.no')}</ToggleButton>
                <ToggleButton value={3}>{t('Staking.lockup.3')}</ToggleButton>
                <ToggleButton value={6}>{t('Staking.lockup.6')}</ToggleButton>
              </ToggleButtonGroup>
            </div>
            <div className="o-row --apy">
              <b>{t('Staking.apy')}:</b>
              <div>
                {lockup === 0 ? '5%' : ''}
                {lockup === 3 ? '10%' : ''}
                {lockup === 6 ? '15%' : ''}
              </div>
            </div>
            <div className="i-ibco-input">
              <TextField
                variant="outlined"
                type="number"
                currencySymbol="OVR"
                minimumValue={'0'}
                decimalCharacter="."
                digitGroupSeparator=","
                onChange={(e) => {
                  handleTransactionValueChange(e.target.value)
                }}
              />
            </div>
            <div className="o-half">
              <HexButton
                url="#"
                text={t('Vesting.allwance', { token: 'OVR' })}
                className={`--orange --large --kyc-button --only-butt`}
                // ${bidValid ? '' : '--disabled'}
                onClick={() => allowanceStaking('ovr')}
              ></HexButton>
            </div>
            <div className="o-half">
              <HexButton
                url="#"
                text={t('Staking.deposit', { token: 'OVR' })}
                className={`--orange --large --kyc-button --only-butt`}
                // ${bidValid ? '' : '--disabled'}
                onClick={() => participateStakingDeposit('ovr')}
              ></HexButton>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row">
              <h3 className="c-section-title">
                {t('Staking.claim.capital', { token: 'OVR' })}
              </h3>
            </div>
            <div className="o-row o-flow-root">
              <div className="o-row">
                <b>{t('Staking.lockup')}:</b>
                <ToggleButtonGroup
                  size="small"
                  value={lockup}
                  exclusive
                  onChange={handleChangeLockup}
                >
                  <ToggleButton value={0}>
                    {t('Staking.lockup.no')}
                  </ToggleButton>
                  <ToggleButton value={3}>{t('Staking.lockup.3')}</ToggleButton>
                  <ToggleButton value={6}>{t('Staking.lockup.6')}</ToggleButton>
                </ToggleButtonGroup>
              </div>
              <div className="o-row --apy">
                <b>{t('Staking.apy')}:</b>
                <div>
                  {lockup === 0 ? '5%' : ''}
                  {lockup === 3 ? '10%' : ''}
                  {lockup === 6 ? '15%' : ''}
                </div>
              </div>
              <div className="o-half i-ibco-input">
                <TextField
                  variant="outlined"
                  type="number"
                  currencySymbol="OVR"
                  minimumValue={'0'}
                  decimalCharacter="."
                  digitGroupSeparator=","
                  onChange={(e) => {
                    handleTransactionValueChange(e.target.value)
                  }}
                />
              </div>
              <div className="o-half">
                <HexButton
                  url="#"
                  text={t('Staking.claim.capital', { token: 'OVR' })}
                  className={`--orange --large --kyc-button --only-butt`}
                  // ${bidValid ? '' : '--disabled'}
                  onClick={() => participateStakingClaim('capital', 'ovr')}
                ></HexButton>
              </div>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row o-flow-root">
              <h3 className="c-section-title">
                {t('Staking.claim.rewards', { token: 'OVR' })}
              </h3>
            </div>
            <div className="o-row">
              <b>{t('Staking.lockup')}:</b>
              <ToggleButtonGroup
                size="small"
                value={lockup}
                exclusive
                onChange={handleChangeLockup}
              >
                <ToggleButton value={0}>{t('Staking.lockup.no')}</ToggleButton>
                <ToggleButton value={3}>{t('Staking.lockup.3')}</ToggleButton>
                <ToggleButton value={6}>{t('Staking.lockup.6')}</ToggleButton>
              </ToggleButtonGroup>
            </div>
            <div className="o-row --apy">
              <b>{t('Staking.apy')}:</b>
              <div>
                {lockup === 0 ? '5%' : ''}
                {lockup === 3 ? '10%' : ''}
                {lockup === 6 ? '15%' : ''}
              </div>
            </div>
            <div className="o-row">
              <HexButton
                url="#"
                text={t('Staking.claim.rewards', { token: 'OVR' })}
                className={`--orange --large --kyc-button --only-butt`}
                // ${bidValid ? '' : '--disabled'}
                onClick={() => participateStakingClaim('stakes', 'ovr')}
              ></HexButton>
            </div>
          </div>
        </>
      )
    }
    if (subTab == 'ovrg') {
      return (
        <>
          <div className="o-row">
            <div className="o-row --value-header">
              <div className="o-one-label">
                <div className="o-label">{t('Staking.total')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG[0]}
                    currency="ovr"
                    text={t('Staking.lockup.0')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG[1]}
                    currency="ovr"
                    text={t('Staking.lockup.3')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG[2]}
                    currency="ovr"
                    text={t('Staking.lockup.6')}
                  ></ValueCounter>
                </div>
              </div>
              <div className="o-one-label">
                <div className="o-label">{t('Staking.total.rewards')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG[3]}
                    currency="ovr"
                    text={t('Staking.lockup.0')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG[4]}
                    currency="ovr"
                    text={t('Staking.lockup.3')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG[5]}
                    currency="ovr"
                    text={t('Staking.lockup.6')}
                  ></ValueCounter>
                </div>
              </div>
              <div className="o-one-label">
                <div className="o-label">{t('Staking.claimed.rewards')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG[6]}
                    currency="ovr"
                    text={t('Staking.lockup.0')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG[7]}
                    currency="ovr"
                    text={t('Staking.lockup.3')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG[8]}
                    currency="ovr"
                    text={t('Staking.lockup.6')}
                  ></ValueCounter>
                </div>
              </div>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row">
              <h3 className="c-section-title">
                {t('Staking.deposit', { token: 'OVRG' })}
              </h3>
            </div>
            <div className="o-row">
              <b>{t('Staking.lockup')}:</b>
              <ToggleButtonGroup
                size="small"
                value={lockup}
                exclusive
                onChange={handleChangeLockup}
              >
                <ToggleButton value={0}>{t('Staking.lockup.no')}</ToggleButton>
                <ToggleButton value={3}>{t('Staking.lockup.3')}</ToggleButton>
                <ToggleButton value={6}>{t('Staking.lockup.6')}</ToggleButton>
              </ToggleButtonGroup>
            </div>
            <div className="o-row --apy">
              <b>{t('Staking.apy')}:</b>
              <div>
                {lockup === 0 ? '10%' : ''}
                {lockup === 3 ? '20%' : ''}
                {lockup === 6 ? '30%' : ''}
              </div>
            </div>
            <div className="o-half i-ibco-input">
              <TextField
                variant="outlined"
                type="number"
                currencySymbol="OVRG"
                minimumValue={'0'}
                decimalCharacter="."
                digitGroupSeparator=","
                onChange={(e) => {
                  handleTransactionValueChange(e.target.value)
                }}
              />
            </div>
            <div className="o-half">
              <HexButton
                url="#"
                text={t('Staking.deposit', { token: 'OVRG' })}
                className={`--orange --large --kyc-button --only-butt`}
                // ${bidValid ? '' : '--disabled'}
                onClick={() => participateStakingDeposit('ovrg')}
              ></HexButton>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row">
              <h3 className="c-section-title">
                {t('Staking.claim.capital', { token: 'OVRG' })}
              </h3>
            </div>
            <div className="o-row o-flow-root">
              <div className="o-row">
                <b>{t('Staking.lockup')}:</b>
                <ToggleButtonGroup
                  size="small"
                  value={lockup}
                  exclusive
                  onChange={handleChangeLockup}
                >
                  <ToggleButton value={0}>
                    {t('Staking.lockup.no')}
                  </ToggleButton>
                  <ToggleButton value={3}>{t('Staking.lockup.3')}</ToggleButton>
                  <ToggleButton value={6}>{t('Staking.lockup.6')}</ToggleButton>
                </ToggleButtonGroup>
              </div>
              <div className="o-row --apy">
                <b>{t('Staking.apy')}:</b>
                <div>
                  {lockup === 0 ? '10%' : ''}
                  {lockup === 3 ? '20%' : ''}
                  {lockup === 6 ? '30%' : ''}
                </div>
              </div>
              <div className="o-half i-ibco-input">
                <TextField
                  variant="outlined"
                  type="number"
                  currencySymbol="OVRG"
                  minimumValue={'0'}
                  decimalCharacter="."
                  digitGroupSeparator=","
                  onChange={(e) => {
                    handleTransactionValueChange(e.target.value)
                  }}
                />
              </div>
              <div className="o-half">
                <HexButton
                  url="#"
                  text={t('Staking.claim.capital', { token: 'OVRG' })}
                  className={`--orange --large --kyc-button --only-butt`}
                  // ${bidValid ? '' : '--disabled'}
                  onClick={() => participateStakingClaim('capital', 'ovrg')}
                ></HexButton>
              </div>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row o-flow-root">
              <h3 className="c-section-title">
                {t('Staking.claim.rewards', { token: 'OVR' })}
              </h3>
            </div>
            <div className="o-row">
              <b>{t('Staking.lockup')}:</b>
              <ToggleButtonGroup
                size="small"
                value={lockup}
                exclusive
                onChange={handleChangeLockup}
              >
                <ToggleButton value={0}>{t('Staking.lockup.no')}</ToggleButton>
                <ToggleButton value={3}>{t('Staking.lockup.3')}</ToggleButton>
                <ToggleButton value={6}>{t('Staking.lockup.6')}</ToggleButton>
              </ToggleButtonGroup>
            </div>
            <div className="o-row --apy">
              <b>{t('Staking.apy')}:</b>
              <div>
                {lockup === 0 ? '10%' : ''}
                {lockup === 3 ? '20%' : ''}
                {lockup === 6 ? '30%' : ''}
              </div>
            </div>
            <div className="o-row">
              <HexButton
                url="#"
                text={t('Staking.claim.rewards', { token: 'OVR' })}
                className={`--orange --large --kyc-button --only-butt`}
                // ${bidValid ? '' : '--disabled'}
                onClick={() => participateStakingClaim('stakes', 'ovrg')}
              ></HexButton>
            </div>
          </div>
        </>
      )
    }
    if (subTab == 'ovrg15') {
      return (
        <>
          <div className="o-row">
            <div className="o-row --value-header">
              <div className="o-one-label">
                <div className="o-label">{t('Staking.total')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG15[0]}
                    currency="ovr"
                    text={t('Staking.lockup.0')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG15[1]}
                    currency="ovr"
                    text={t('Staking.lockup.3')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG15[2]}
                    currency="ovr"
                    text={t('Staking.lockup.6')}
                  ></ValueCounter>
                </div>
              </div>
              <div className="o-one-label">
                <div className="o-label">{t('Staking.total.rewards')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG15[3]}
                    currency="ovr"
                    text={t('Staking.lockup.0')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG15[4]}
                    currency="ovr"
                    text={t('Staking.lockup.3')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG15[5]}
                    currency="ovr"
                    text={t('Staking.lockup.6')}
                  ></ValueCounter>
                </div>
              </div>
              <div className="o-one-label">
                <div className="o-label">{t('Staking.claimed.rewards')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG15[6]}
                    currency="ovr"
                    text={t('Staking.lockup.0')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG15[7]}
                    currency="ovr"
                    text={t('Staking.lockup.3')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG15[8]}
                    currency="ovr"
                    text={t('Staking.lockup.6')}
                  ></ValueCounter>
                </div>
              </div>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row">
              <h3 className="c-section-title">
                {t('Staking.deposit', { token: 'OVRG15' })}
              </h3>
            </div>
            <div className="o-row">
              <b>{t('Staking.lockup')}:</b>
              <ToggleButtonGroup
                size="small"
                value={lockup}
                exclusive
                onChange={handleChangeLockup}
              >
                <ToggleButton value={0}>{t('Staking.lockup.no')}</ToggleButton>
                <ToggleButton value={3}>{t('Staking.lockup.3')}</ToggleButton>
                <ToggleButton value={6}>{t('Staking.lockup.6')}</ToggleButton>
              </ToggleButtonGroup>
            </div>
            <div className="o-row --apy">
              <b>{t('Staking.apy')}:</b>
              <div>
                {lockup === 0 ? '10%' : ''}
                {lockup === 3 ? '20%' : ''}
                {lockup === 6 ? '30%' : ''}
              </div>
            </div>
            <div className="o-half i-ibco-input">
              <TextField
                variant="outlined"
                type="number"
                currencySymbol="OVRG15"
                minimumValue={'0'}
                decimalCharacter="."
                digitGroupSeparator=","
                onChange={(e) => {
                  handleTransactionValueChange(e.target.value)
                }}
              />
            </div>
            <div className="o-half">
              <HexButton
                url="#"
                text={t('Staking.deposit', { token: 'OVRG15' })}
                className={`--orange --large --kyc-button --only-butt`}
                // ${bidValid ? '' : '--disabled'}
                onClick={() => participateStakingDeposit('ovrg15')}
              ></HexButton>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row">
              <h3 className="c-section-title">
                {t('Staking.claim.capital', { token: 'OVRG15' })}
              </h3>
            </div>
            <div className="o-row o-flow-root">
              <div className="o-row">
                <b>{t('Staking.lockup')}:</b>
                <ToggleButtonGroup
                  size="small"
                  value={lockup}
                  exclusive
                  onChange={handleChangeLockup}
                >
                  <ToggleButton value={0}>
                    {t('Staking.lockup.no')}
                  </ToggleButton>
                  <ToggleButton value={3}>{t('Staking.lockup.3')}</ToggleButton>
                  <ToggleButton value={6}>{t('Staking.lockup.6')}</ToggleButton>
                </ToggleButtonGroup>
              </div>
              <div className="o-row --apy">
                <b>{t('Staking.apy')}:</b>
                <div>
                  {lockup === 0 ? '10%' : ''}
                  {lockup === 3 ? '20%' : ''}
                  {lockup === 6 ? '30%' : ''}
                </div>
              </div>
              <div className="o-half i-ibco-input">
                <TextField
                  variant="outlined"
                  type="number"
                  currencySymbol="OVRG15"
                  minimumValue={'0'}
                  decimalCharacter="."
                  digitGroupSeparator=","
                  onChange={(e) => {
                    handleTransactionValueChange(e.target.value)
                  }}
                />
              </div>
              <div className="o-half">
                <HexButton
                  url="#"
                  text={t('Staking.claim.capital', { token: 'OVRG15' })}
                  className={`--orange --large --kyc-button --only-butt`}
                  // ${bidValid ? '' : '--disabled'}
                  onClick={() => participateStakingClaim('capital', 'ovrg15')}
                ></HexButton>
              </div>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row o-flow-root">
              <h3 className="c-section-title">
                {t('Staking.claim.rewards', { token: 'OVR' })}
              </h3>
            </div>
            <div className="o-row">
              <b>{t('Staking.lockup')}:</b>
              <ToggleButtonGroup
                size="small"
                value={lockup}
                exclusive
                onChange={handleChangeLockup}
              >
                <ToggleButton value={0}>{t('Staking.lockup.no')}</ToggleButton>
                <ToggleButton value={3}>{t('Staking.lockup.3')}</ToggleButton>
                <ToggleButton value={6}>{t('Staking.lockup.6')}</ToggleButton>
              </ToggleButtonGroup>
            </div>
            <div className="o-row --apy">
              <b>{t('Staking.apy')}:</b>
              <div>
                {lockup === 0 ? '10%' : ''}
                {lockup === 3 ? '20%' : ''}
                {lockup === 6 ? '30%' : ''}
              </div>
            </div>
            <div className="o-row">
              <HexButton
                url="#"
                text={t('Staking.claim.rewards', { token: 'OVR' })}
                className={`--orange --large --kyc-button --only-butt`}
                // ${bidValid ? '' : '--disabled'}
                onClick={() => participateStakingClaim('stakes', 'ovrg15')}
              ></HexButton>
            </div>
          </div>
        </>
      )
    }
    if (subTab == 'ovrg30') {
      return (
        <>
          <div className="o-row">
            <div className="o-row --value-header">
              <div className="o-one-label">
                <div className="o-label">{t('Staking.total')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG30[0]}
                    currency="ovr"
                    text={t('Staking.lockup.0')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG30[1]}
                    currency="ovr"
                    text={t('Staking.lockup.3')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG30[2]}
                    currency="ovr"
                    text={t('Staking.lockup.6')}
                  ></ValueCounter>
                </div>
              </div>
              <div className="o-one-label">
                <div className="o-label">{t('Staking.total.rewards')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG30[3]}
                    currency="ovr"
                    text={t('Staking.lockup.0')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG30[4]}
                    currency="ovr"
                    text={t('Staking.lockup.3')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG30[5]}
                    currency="ovr"
                    text={t('Staking.lockup.6')}
                  ></ValueCounter>
                </div>
              </div>
              <div className="o-one-label">
                <div className="o-label">{t('Staking.claimed.rewards')}</div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG30[6]}
                    currency="ovr"
                    text={t('Staking.lockup.0')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG30[7]}
                    currency="ovr"
                    text={t('Staking.lockup.3')}
                  ></ValueCounter>
                </div>
                <div className="o-value">
                  <ValueCounter
                    value={stakingValuesOVRG30[8]}
                    currency="ovr"
                    text={t('Staking.lockup.6')}
                  ></ValueCounter>
                </div>
              </div>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row">
              <h3 className="c-section-title">
                {t('Staking.deposit', { token: 'OVRG30' })}
              </h3>
            </div>
            <div className="o-row">
              <b>{t('Staking.lockup')}:</b>
              <ToggleButtonGroup
                size="small"
                value={lockup}
                exclusive
                onChange={handleChangeLockup}
              >
                <ToggleButton value={0}>{t('Staking.lockup.no')}</ToggleButton>
                <ToggleButton value={3}>{t('Staking.lockup.3')}</ToggleButton>
                <ToggleButton value={6}>{t('Staking.lockup.6')}</ToggleButton>
              </ToggleButtonGroup>
            </div>
            <div className="o-row --apy">
              <b>{t('Staking.apy')}:</b>
              <div>
                {lockup === 0 ? '10%' : ''}
                {lockup === 3 ? '20%' : ''}
                {lockup === 6 ? '30%' : ''}
              </div>
            </div>
            <div className="o-half i-ibco-input">
              <TextField
                variant="outlined"
                type="number"
                currencySymbol="OVRG30"
                minimumValue={'0'}
                decimalCharacter="."
                digitGroupSeparator=","
                onChange={(e) => {
                  handleTransactionValueChange(e.target.value)
                }}
              />
            </div>
            <div className="o-half">
              <HexButton
                url="#"
                text={t('Staking.deposit', { token: 'OVRG30' })}
                className={`--orange --large --kyc-button --only-butt`}
                // ${bidValid ? '' : '--disabled'}
                onClick={() => participateStakingDeposit('ovrg30')}
              ></HexButton>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row">
              <h3 className="c-section-title">
                {t('Staking.claim.capital', { token: 'OVRG30' })}
              </h3>
            </div>
            <div className="o-row o-flow-root">
              <div className="o-row">
                <b>{t('Staking.lockup')}:</b>
                <ToggleButtonGroup
                  size="small"
                  value={lockup}
                  exclusive
                  onChange={handleChangeLockup}
                >
                  <ToggleButton value={0}>
                    {t('Staking.lockup.no')}
                  </ToggleButton>
                  <ToggleButton value={3}>{t('Staking.lockup.3')}</ToggleButton>
                  <ToggleButton value={6}>{t('Staking.lockup.6')}</ToggleButton>
                </ToggleButtonGroup>
              </div>
              <div className="o-row --apy">
                <b>{t('Staking.apy')}:</b>
                <div>
                  {lockup === 0 ? '10%' : ''}
                  {lockup === 3 ? '20%' : ''}
                  {lockup === 6 ? '30%' : ''}
                </div>
              </div>
              <div className="o-half i-ibco-input">
                <TextField
                  variant="outlined"
                  type="number"
                  currencySymbol="OVRG30"
                  minimumValue={'0'}
                  decimalCharacter="."
                  digitGroupSeparator=","
                  onChange={(e) => {
                    handleTransactionValueChange(e.target.value)
                  }}
                />
              </div>
              <div className="o-half">
                <HexButton
                  url="#"
                  text={t('Staking.claim.capital', { token: 'OVRG30' })}
                  className={`--orange --large --kyc-button --only-butt`}
                  // ${bidValid ? '' : '--disabled'}
                  onClick={() => participateStakingClaim('capital', 'ovrg30')}
                ></HexButton>
              </div>
            </div>
          </div>
          <div className="o-line --venti"></div>
          <div className="o-row o-flow-root">
            <div className="o-row o-flow-root">
              <h3 className="c-section-title">
                {t('Staking.claim.rewards', { token: 'OVR' })}
              </h3>
            </div>
            <div className="o-row">
              <b>{t('Staking.lockup')}:</b>
              <ToggleButtonGroup
                size="small"
                value={lockup}
                exclusive
                onChange={handleChangeLockup}
              >
                <ToggleButton value={0}>{t('Staking.lockup.no')}</ToggleButton>
                <ToggleButton value={3}>{t('Staking.lockup.3')}</ToggleButton>
                <ToggleButton value={6}>{t('Staking.lockup.6')}</ToggleButton>
              </ToggleButtonGroup>
            </div>
            <div className="o-row --apy">
              <b>{t('Staking.apy')}:</b>
              <div>
                {lockup === 0 ? '10%' : ''}
                {lockup === 3 ? '20%' : ''}
                {lockup === 6 ? '30%' : ''}
              </div>
            </div>
            <div className="o-row">
              <HexButton
                url="#"
                text={t('Staking.claim.rewards', { token: 'OVR' })}
                className={`--orange --large --kyc-button --only-butt`}
                // ${bidValid ? '' : '--disabled'}
                onClick={() => participateStakingClaim('stakes', 'ovrg30')}
              ></HexButton>
            </div>
          </div>
        </>
      )
    }
  }

  const renderTab = () => {
    if (tab == 'vesting') {
      return (
        <>
          <div className="o-row">
            <div className="c-sub-tab-selector_cont">
              <div
                className={`c-sub-tab-selector ${
                  subTab == 'ovrg' ? '--selected' : ''
                }`}
                onClick={() => handleSubTabChange('ovrg')}
              >
                OVRG
              </div>
              <div
                className={`c-sub-tab-selector ${
                  subTab == 'ovrg15' ? '--selected' : ''
                }`}
                onClick={() => {
                  handleSubTabChange('ovrg15')
                }}
              >
                OVRG15
              </div>
              <div
                className={`c-sub-tab-selector ${
                  subTab == 'ovrg30' ? '--selected' : ''
                }`}
                onClick={() => {
                  handleSubTabChange('ovrg30')
                }}
              >
                OVRG30
              </div>
            </div>
          </div>
          <div className="o-line --venti"></div>
          {renderSubTabVesting()}
        </>
      )
    } else {
      return (
        <>
          <div className="o-row"></div>
          {renderSubTabStaking()}
        </>
      )
    }
  }

  const StakingContentLoginRequired = () => {
    const { t, i18n } = useTranslation()
    return (
      <div className="profile">
        <div className="o-container">
          <div className="c-dialog --centered">
            <div className="c-dialog-main-title">
              {t('Generic.login.required.title')}
              <span role="img" aria-label="Cool dude">
                😎
              </span>
            </div>
            <div className="c-dialog-sub-title">
              {t('Generic.login.required.desc')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!userAuthenticated) {
    return <StakingContentLoginRequired t={t} />
  } else {
    return (
      <div className="Staking">
        <div className="o-container">
          <div className="o-section">
            <div className="o-first">
              <div className="o-card">
                <div className="o-row">
                  <h3 className="p-card-title">{t('Staking.title')}</h3>
                </div>
                <div className="o-row">
                  {t('Staking.desc.copy.ovr')
                    .split('\n')
                    .reduce(
                      (r, c, x) => (r ? [...r, <br key={x} />, c] : [c]),
                      null
                    )}
                </div>
              </div>
            </div>
            <div className="o-second">
              <div className="o-card ">{renderTab()}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Staking
