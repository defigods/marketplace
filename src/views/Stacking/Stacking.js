import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import HexButton from '../../components/HexButton/HexButton';
import TermsAndConditionsOverlay from '../../components/TermsAndConditionsOverlay/TermsAndConditionsOverlay';
import { Web3Context } from '../../context/Web3Context';
import { UserContext } from '../../context/UserContext';
import { getToken, removeToken, saveToken } from '../../lib/auth';

import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';

import { warningNotification, successNotification } from '../../lib/notifications';
import CircularProgress from '@material-ui/core/CircularProgress';

import { ethers, BigNumber, utils } from 'ethers';
import bn from 'bignumber.js';

import config from '../../lib/config';
import { isPositiveFloat } from '../../lib/config';
import { useHistory, Link } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';

import { getCurrentLocale } from '../../i18n';

import Tooltip from '@material-ui/core/Tooltip';
import Help from '@material-ui/icons/Help';

const mantissa = new bn(1e18);

function Stacking() {
	const { t, i18n } = useTranslation();
	const [tab, setTab] = React.useState('stacking');

	const [stackingValuesOVR, setStackingValuesOVR] = React.useState([0, 0, 0, 0, 0, 0, 0, 0, 0]); // 0-stacking, 0-rewards, 0-claimed, 3-stacking, 3-rewards..
	const [stackingValuesOVRG, setStackingValuesOVRG] = React.useState([0, 0, 0, 0, 0, 0, 0, 0, 0]); // 0-stacking, 0-rewards, 0-claimed, 3-stacking, 3-rewards..
	const [stackingValuesOVRG15, setStackingValuesOVRG15] = React.useState([0, 0, 0, 0, 0, 0, 0, 0, 0]); // 0-stacking, 0-rewards, 0-claimed, 3-stacking, 3-rewards..
	const [stackingValuesOVRG30, setStackingValuesOVRG30] = React.useState([0, 0, 0, 0, 0, 0, 0, 0, 0]); // 0-stacking, 0-rewards, 0-claimed, 3-stacking, 3-rewards..
	const [vestingValues, setVestingValues] = React.useState([0, 0, 0, 0, 0, 0, 0, 0, 0]); // OVRG-assigned, OVRG-vested, OVRG-claimed, OVRG15-assigned, OVRG15-vested, OVRG15-claimed..

	const [subTab, setSubTab] = React.useState('ovr');
	const [transactionValue, setTransactionValue] = React.useState(0.0);
	const [transactionValueValid, setTransactionValueValid] = React.useState(false);
	const [lockup, setLockup] = React.useState(0);

	let history = useHistory();
	const web3Context = useContext(Web3Context);
	const userContext = useContext(UserContext);
	const [web3IsReady, setWeb3IsReady] = React.useState(false);
	const { isLoggedIn: userAuthenticated } = userContext.state;

	const [ibcoIsKYCPassed, setIbcoIsKYCPassed] = React.useState(false);

	const loadStakingDeposit = async () => {
		if (web3Context.state.VestOVRGViewer) {
			//let depOVRG = await web3Context.state.VestOVRGViewer.deposited(web3Context.state.address);
			//let bnValue=new bn(1).times(mantissa).toFixed(0)
			// no lockup
			let stakeBalOVR = await web3Context.state.StakeOVRViewer.balances(web3Context.state.address, 1);
			let stakeBalOVRHuman = parseFloat(ethers.utils.formatEther(stakeBalOVR).toString()).toFixed(2);
			let stakeBalOVRG = await web3Context.state.StakeOVRGViewer.balances(web3Context.state.address, 1);
			let stakeBalOVRGHuman = parseFloat(ethers.utils.formatEther(stakeBalOVRG).toString()).toFixed(2);
			let stakeBalOVRG15 = await web3Context.state.StakeOVRG15Viewer.balances(web3Context.state.address, 1);
			let stakeBalOVRG15Human = parseFloat(ethers.utils.formatEther(stakeBalOVRG15).toString()).toFixed(2);
			let stakeBalOVRG30 = await web3Context.state.StakeOVRG30Viewer.balances(web3Context.state.address, 1);
			let stakeBalOVRG30Human = parseFloat(ethers.utils.formatEther(stakeBalOVRG30).toString()).toFixed(2);
			//3 months
			let stakeBalOVR3 = await web3Context.state.StakeOVRViewer.balances(web3Context.state.address, 2);
			let stakeBalOVRHuman3 = parseFloat(ethers.utils.formatEther(stakeBalOVR3).toString()).toFixed(2);
			let stakeBalOVRG3 = await web3Context.state.StakeOVRGViewer.balances(web3Context.state.address, 2);
			let stakeBalOVRGHuman3 = parseFloat(ethers.utils.formatEther(stakeBalOVRG3).toString()).toFixed(2);
			let stakeBalOVRG153 = await web3Context.state.StakeOVRG15Viewer.balances(web3Context.state.address, 2);
			let stakeBalOVRG15Human3 = parseFloat(ethers.utils.formatEther(stakeBalOVRG153).toString()).toFixed(2);
			let stakeBalOVRG303 = await web3Context.state.StakeOVRG30Viewer.balances(web3Context.state.address, 2);
			let stakeBalOVRG30Human3 = parseFloat(ethers.utils.formatEther(stakeBalOVRG303).toString()).toFixed(2);
			//6 months
			let stakeBalOVR6 = await web3Context.state.StakeOVRViewer.balances(web3Context.state.address, 3);
			let stakeBalOVRHuman6 = parseFloat(ethers.utils.formatEther(stakeBalOVR6).toString()).toFixed(2);
			let stakeBalOVRG6 = await web3Context.state.StakeOVRGViewer.balances(web3Context.state.address, 3);
			let stakeBalOVRGHuman6 = parseFloat(ethers.utils.formatEther(stakeBalOVRG6).toString()).toFixed(2);
			let stakeBalOVRG156 = await web3Context.state.StakeOVRG15Viewer.balances(web3Context.state.address, 3);
			let stakeBalOVRG15Human6 = parseFloat(ethers.utils.formatEther(stakeBalOVRG156).toString()).toFixed(2);
			let stakeBalOVRG306 = await web3Context.state.StakeOVRG30Viewer.balances(web3Context.state.address, 3);
			let stakeBalOVRG30Human6 = parseFloat(ethers.utils.formatEther(stakeBalOVRG306).toString()).toFixed(2);

			//CLAIMED rewardSigner
			let stakeCrewOVR = await web3Context.state.StakeOVRViewer.claimedRewards(web3Context.state.address, 1);
			let stakeCrewOVRHuman = parseFloat(ethers.utils.formatEther(stakeCrewOVR).toString()).toFixed(2);
			let stakeCrewOVRG = await web3Context.state.StakeOVRGViewer.claimedRewards(web3Context.state.address, 1);
			let stakeCrewOVRGHuman = parseFloat(ethers.utils.formatEther(stakeCrewOVRG).toString()).toFixed(2);
			let stakeCrewOVRG15 = await web3Context.state.StakeOVRG15Viewer.claimedRewards(web3Context.state.address, 1);
			let stakeCrewOVRG15Human = parseFloat(ethers.utils.formatEther(stakeCrewOVRG15).toString()).toFixed(2);
			let stakeCrewOVRG30 = await web3Context.state.StakeOVRG30Viewer.claimedRewards(web3Context.state.address, 1);
			let stakeCrewOVRG30Human = parseFloat(ethers.utils.formatEther(stakeCrewOVRG30).toString()).toFixed(2);
			// 3months
			let stakeCrewOVR3 = await web3Context.state.StakeOVRViewer.claimedRewards(web3Context.state.address, 2);
			let stakeCrewOVRHuman3 = parseFloat(ethers.utils.formatEther(stakeCrewOVR3).toString()).toFixed(2);
			let stakeCrewOVRG3 = await web3Context.state.StakeOVRGViewer.claimedRewards(web3Context.state.address, 2);
			let stakeCrewOVRGHuman3 = parseFloat(ethers.utils.formatEther(stakeCrewOVRG3).toString()).toFixed(2);
			let stakeCrewOVRG153 = await web3Context.state.StakeOVRG15Viewer.claimedRewards(web3Context.state.address, 2);
			let stakeCrewOVRG15Human3 = parseFloat(ethers.utils.formatEther(stakeCrewOVRG153).toString()).toFixed(2);
			let stakeCrewOVRG303 = await web3Context.state.StakeOVRG30Viewer.claimedRewards(web3Context.state.address, 2);
			let stakeCrewOVRG30Human3 = parseFloat(ethers.utils.formatEther(stakeCrewOVRG303).toString()).toFixed(2);
			// 6 months
			let stakeCrewOVR6 = await web3Context.state.StakeOVRViewer.claimedRewards(web3Context.state.address, 3);
			let stakeCrewOVRHuman6 = parseFloat(ethers.utils.formatEther(stakeCrewOVR6).toString()).toFixed(2);
			let stakeCrewOVRG6 = await web3Context.state.StakeOVRGViewer.claimedRewards(web3Context.state.address, 3);
			let stakeCrewOVRGHuman6 = parseFloat(ethers.utils.formatEther(stakeCrewOVRG6).toString()).toFixed(2);
			let stakeCrewOVRG156 = await web3Context.state.StakeOVRG15Viewer.claimedRewards(web3Context.state.address, 3);
			let stakeCrewOVRG15Human6 = parseFloat(ethers.utils.formatEther(stakeCrewOVRG156).toString()).toFixed(2);
			let stakeCrewOVRG306 = await web3Context.state.StakeOVRG30Viewer.claimedRewards(web3Context.state.address, 3);
			let stakeCrewOVRG30Human6 = parseFloat(ethers.utils.formatEther(stakeCrewOVRG306).toString()).toFixed(2);

			// updated rewards
			let depositDate = await web3Context.state.StakeOVRViewer.depositDates(web3Context.state.address, 1);
			let getRewOVR = await web3Context.state.StakeOVRViewer.getAccruedEmission(depositDate, stakeBalOVR, 1);
			let getRewOVRHuman = parseFloat(ethers.utils.formatEther(getRewOVR[0]).toString()).toFixed(3);
			depositDate = await web3Context.state.StakeOVRGViewer.depositDates(web3Context.state.address, 1);
			let getRewOVRG = await web3Context.state.StakeOVRGViewer.getAccruedEmission(depositDate, stakeBalOVRG, 1);
			let getRewOVRGHuman = parseFloat(ethers.utils.formatEther(getRewOVRG[0]).toString()).toFixed(3);
			depositDate = await web3Context.state.StakeOVRG15Viewer.depositDates(web3Context.state.address, 1);
			let getRewOVRG15 = await web3Context.state.StakeOVRG15Viewer.getAccruedEmission(depositDate, stakeBalOVRG15, 1);
			let getRewOVRG15Human = parseFloat(ethers.utils.formatEther(getRewOVRG15[0]).toString()).toFixed(3);
			depositDate = await web3Context.state.StakeOVRG30Viewer.depositDates(web3Context.state.address, 1);
			let getRewOVRG30 = await web3Context.state.StakeOVRG30Viewer.getAccruedEmission(depositDate, stakeBalOVRG30, 1);
			let getRewOVRG30Human = parseFloat(ethers.utils.formatEther(getRewOVRG30[0]).toString()).toFixed(3);
			// 3 Months
			depositDate = await web3Context.state.StakeOVRViewer.depositDates(web3Context.state.address, 2);
			let getRewOVR3 = await web3Context.state.StakeOVRViewer.getAccruedEmission(depositDate, stakeBalOVR3, 2);
			let getRewOVRHuman3 = parseFloat(ethers.utils.formatEther(getRewOVR3[0]).toString()).toFixed(3);
			depositDate = await web3Context.state.StakeOVRGViewer.depositDates(web3Context.state.address, 2);
			let getRewOVRG3 = await web3Context.state.StakeOVRGViewer.getAccruedEmission(depositDate, stakeBalOVRG3, 2);
			let getRewOVRGHuman3 = parseFloat(ethers.utils.formatEther(getRewOVRG3[0]).toString()).toFixed(3);
			depositDate = await web3Context.state.StakeOVRG15Viewer.depositDates(web3Context.state.address, 2);
			let getRewOVRG153 = await web3Context.state.StakeOVRG15Viewer.getAccruedEmission(depositDate, stakeBalOVRG153, 2);
			let getRewOVRG15Human3 = parseFloat(ethers.utils.formatEther(getRewOVRG153[0]).toString()).toFixed(3);
			depositDate = await web3Context.state.StakeOVRG30Viewer.depositDates(web3Context.state.address, 2);
			let getRewOVRG303 = await web3Context.state.StakeOVRG30Viewer.getAccruedEmission(depositDate, stakeBalOVRG153, 2);
			let getRewOVRG30Human3 = parseFloat(ethers.utils.formatEther(getRewOVRG303[0]).toString()).toFixed(3);
			// 6 months
			depositDate = await web3Context.state.StakeOVRViewer.depositDates(web3Context.state.address, 3);
			let getRewOVR6 = await web3Context.state.StakeOVRViewer.getAccruedEmission(depositDate, stakeBalOVR6, 3);
			let getRewOVRHuman6 = parseFloat(ethers.utils.formatEther(getRewOVR6[0]).toString()).toFixed(3);
			depositDate = await web3Context.state.StakeOVRGViewer.depositDates(web3Context.state.address, 3);
			let getRewOVRG6 = await web3Context.state.StakeOVRGViewer.getAccruedEmission(depositDate, stakeBalOVRG6, 3);
			let getRewOVRGHuman6 = parseFloat(ethers.utils.formatEther(getRewOVRG6[0]).toString()).toFixed(3);
			depositDate = await web3Context.state.StakeOVRG15Viewer.depositDates(web3Context.state.address, 3);
			let getRewOVRG156 = await web3Context.state.StakeOVRG15Viewer.getAccruedEmission(depositDate, stakeBalOVRG156, 3);
			let getRewOVRG15Human6 = parseFloat(ethers.utils.formatEther(getRewOVRG156[0]).toString()).toFixed(3);
			depositDate = await web3Context.state.StakeOVRG30Viewer.depositDates(web3Context.state.address, 3);
			let getRewOVRG306 = await web3Context.state.StakeOVRG30Viewer.getAccruedEmission(depositDate, stakeBalOVRG306, 3);
			let getRewOVRG30Human6 = parseFloat(ethers.utils.formatEther(getRewOVRG306[0]).toString()).toFixed(3);
			console.log('Rewards updated: ', getRewOVRHuman);

			setStackingValuesOVR([
				stakeBalOVRHuman,
				stakeBalOVRHuman3,
				stakeBalOVRHuman6,
				getRewOVRHuman,
				getRewOVRHuman3,
				getRewOVRHuman6,
				stakeCrewOVRHuman,
				stakeCrewOVRHuman3,
				stakeCrewOVRHuman6,
			]);
			setStackingValuesOVRG([
				stakeBalOVRGHuman,
				stakeBalOVRGHuman3,
				stakeBalOVRGHuman6,
				getRewOVRGHuman,
				getRewOVRGHuman3,
				getRewOVRGHuman6,
				stakeCrewOVRGHuman,
				stakeCrewOVRGHuman3,
				stakeCrewOVRGHuman6,
			]);
			setStackingValuesOVRG15([
				stakeBalOVRG15Human,
				stakeBalOVRG15Human3,
				stakeBalOVRG15Human6,
				getRewOVRG15Human,
				getRewOVRG15Human3,
				getRewOVRG30Human6,
				stakeCrewOVRG15Human,
				stakeCrewOVRG15Human3,
				stakeCrewOVRG15Human6,
			]);
			setStackingValuesOVRG30([
				stakeBalOVRG30Human,
				stakeBalOVRG30Human3,
				stakeBalOVRG30Human6,
				getRewOVRG30Human,
				getRewOVRG15Human3,
				getRewOVRG30Human6,
				stakeCrewOVRG30Human,
				stakeCrewOVRG30Human3,
				stakeCrewOVRG30Human6,
			]);
		}
	};

	const loadVestingDeposit = async () => {
		if (web3Context.state.VestOVRGViewer) {
			//let depOVRG = await web3Context.state.VestOVRGViewer.deposited(web3Context.state.address);
			let depOVRG = await web3Context.state.VestOVRGViewer.grants(web3Context.state.address);
			let depOVRGHuman = parseFloat(ethers.utils.formatEther(depOVRG.value).toString()).toFixed(2);
			let depOVRGClaimedHuman = parseFloat(ethers.utils.formatEther(depOVRG.transferred).toString()).toFixed(2);

			let depOVRG15 = await web3Context.state.VestOVRG15Viewer.grants(web3Context.state.address);
			let depOVRG15Human = parseFloat(ethers.utils.formatEther(depOVRG15.value).toString()).toFixed(2);
			let depOVRG15ClaimedHuman = parseFloat(ethers.utils.formatEther(depOVRG15.transferred).toString()).toFixed(2);

			let depOVRG30 = await web3Context.state.VestOVRG30Viewer.grants(web3Context.state.address);
			let depOVRG30Human = parseFloat(ethers.utils.formatEther(depOVRG30.value).toString()).toFixed(2);
			let depOVRG30ClaimedHuman = parseFloat(ethers.utils.formatEther(depOVRG30.transferred).toString()).toFixed(2);

			setVestingValues([
				depOVRGHuman,
				depOVRGHuman,
				depOVRGClaimedHuman,
				depOVRG15Human,
				depOVRG15Human,
				depOVRG15ClaimedHuman,
				depOVRG30Human,
				depOVRG30Human,
				depOVRG30ClaimedHuman,
			]); // OVRG-assigned, OVRG-vested, OVRG-claimed, OVRG15-assigned, OVRG15-vested, OVRG15-claimed..
		}
	};

	// On Web3Loaded
	React.useEffect(() => {
		// saveToken('lastVisitedPage', '/stacking')

		if (web3Context.state) {
			if (web3Context.state.ibcoSetupComplete) {
				if (web3Context.state.ibcoSetupComplete === true) {
					setWeb3IsReady(true);
				}
			}
		}
	}, [web3Context]);

	React.useEffect(() => {
		loadVestingDeposit();
		loadStakingDeposit();
		setInterval(() => {
			loadVestingDeposit();
			loadStakingDeposit();
		}, 30000);
	}, [web3IsReady]);

	// Check if terms condition changed from userstate and kyc passed
	React.useEffect(() => {
		if (userContext.state.user.kycReviewAnswer === 1) {
			setIbcoIsKYCPassed(true);
		}
	}, [userContext.state.user.kycReviewAnswer]);

	// Interface helpers
	const handleTabChange = (newValue) => {
		setTab(newValue);
		setTransactionValue(0.0);
		setTransactionValueValid(false);
		if (tab === 'vesting') {
			setSubTab('ovr');
		} else {
			setSubTab('ovrg');
		}
	};

	const handleSubTabChange = (newValue) => {
		setSubTab(newValue);
		setTransactionValue(0.0);
		setTransactionValueValid(false);
	};

	const handleTransactionValueChange = async (transaction) => {
		let transactionValue = parseFloat(transaction);
		setTransactionValueValid(true);
		setTransactionValue(transactionValue);
	};

	const handleChangeLockup = (event, newLockup) => {
		setLockup(newLockup);
	};

	// Stacking
	const participateStackingDeposit = async (currency) => {
		console.log('participateStackingDeposit', currency);
		console.log('value', transactionValue);
		console.log('lockup', lockup);
		// check on values
		if (!isPositiveFloat(transactionValue)) {
			warningNotification(t('Warning.amount.invalid.title'), t('Warning.amount.invalid.desc'));
			return false;
		}
		// convert to BN to do the deposit
		let bnValue = new bn(transactionValue).times(mantissa).toFixed(0);
		let lockup2 = 0;
		if (lockup == 0) {
			lockup2 = 1;
		}
		if (lockup == 3) {
			lockup2 = 2;
		}
		if (lockup == 6) {
			lockup2 = 3;
		}

		if (currency === 'ovr') {
			let allowanceOVR = await web3Context.state.ibcoRewardViewer.allowance(
				web3Context.state.address,
				config.apis.stakingOVR,
			);
			allowanceOVR = parseFloat(ethers.utils.formatEther(allowanceOVR).toString()).toFixed(2);
			if (allowanceOVR < parseFloat(transactionValue)) {
				warningNotification(t('Warning.allowance.invalid.title'), t('Warning.allowance.invalid.desc'));
				return false;
			}
			let stakeBalOVR = await web3Context.state.StakeOVRSigner.deposit(lockup2, bnValue);
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
		if (currency === 'ovrg') {
			let allowanceOVRG = await web3Context.state.tokenOVRGViewer.allowance(
				web3Context.state.address,
				config.apis.stakingOVRG,
			);
			allowanceOVRG = parseFloat(ethers.utils.formatEther(allowanceOVRG).toString()).toFixed(2);
			if (allowanceOVRG < parseFloat(transactionValue)) {
				warningNotification(t('Warning.allowance.invalid.title'), t('Warning.allowance.invalid.desc'));
				return false;
			}
			let stakeBalOVRG = await web3Context.state.StakeOVRGSigner.deposit(lockup2, bnValue);
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
		if (currency === 'ovrg15') {
			let allowanceOVRG15 = await web3Context.state.tokenOVRG15Viewer.allowance(
				web3Context.state.address,
				config.apis.stakingOVRG15,
			);
			allowanceOVRG15 = parseFloat(ethers.utils.formatEther(allowanceOVRG15).toString()).toFixed(2);
			if (allowanceOVRG15 < parseFloat(transactionValue)) {
				warningNotification(t('Warning.allowance.invalid.title'), t('Warning.allowance.invalid.desc'));
				return false;
			}
			let stakeBalOVRG15 = await web3Context.state.StakeOVRG15Signer.deposit(lockup2, bnValue);
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
		if (currency === 'ovrg30') {
			let allowanceOVRG30 = await web3Context.state.tokenOVRG30Viewer.allowance(
				web3Context.state.address,
				config.apis.stakingOVRG30,
			);
			allowanceOVRG30 = parseFloat(ethers.utils.formatEther(allowanceOVRG30).toString()).toFixed(2);
			if (allowanceOVRG30 < parseFloat(transactionValue)) {
				warningNotification(t('Warning.allowance.invalid.title'), t('Warning.allowance.invalid.desc'));
				return false;
			}
			let stakeBalOVRG30 = await web3Context.state.StakeOVRG30Signer.deposit(lockup2, bnValue);
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
	};

	const participateStackingClaim = async (kind, currency) => {
		console.log('participateStackingDeposit', { kind, currency });
		console.log('value', transactionValue);
		console.log('lockup', lockup);
		// convert to BN to do the deposit
		let bnValue = new bn(transactionValue).times(mantissa).toFixed(0);
		let lockup2 = 0;
		if (lockup == 0) {
			lockup2 = 1;
		}
		if (lockup == 3) {
			lockup2 = 2;
		}
		if (lockup == 6) {
			lockup2 = 3;
		}

		if (kind === 'capital') {
			// check on values
			if (!isPositiveFloat(transactionValue)) {
				warningNotification(t('Warning.amount.invalid.title'), t('Warning.amount.invalid.desc'));
				return false;
			}
			if (currency === 'ovr') {
				let stakeCapOVR = await web3Context.state.StakeOVRSigner.makeWithdrawal(lockup2, bnValue);
			}
			if (currency === 'ovrg') {
				let stakeCapOVRG = await web3Context.state.StakeOVRGSigner.makeWithdrawal(lockup2, bnValue);
			}
			if (currency === 'ovrg15') {
				let stakeCapOVRG15 = await web3Context.state.StakeOVRG15Signer.makeWithdrawal(lockup2, bnValue);
			}
			if (currency === 'ovrg30') {
				let stakeCapOVRG30 = await web3Context.state.StakeOVRG30Signer.makeWithdrawal(lockup2, bnValue);
			}
		}
		if (kind === 'stakes') {
			if (currency === 'ovr') {
				let stakeSTKOVR = await web3Context.state.StakeOVRSigner.makeWithdrawalRewards(lockup2);
			}
			if (currency === 'ovrg') {
				let stakeSTKOVRG = await web3Context.state.StakeOVRGSigner.makeWithdrawalRewards(lockup2);
			}
			if (currency === 'ovrg15') {
				let stakeSTKOVRG15 = await web3Context.state.StakeOVRG15Signer.makeWithdrawalRewards(lockup2);
			}
			if (currency === 'ovrg30') {
				let stakeSTKOVRG30 = await web3Context.state.StakeOVRG30Signer.makeWithdrawalRewards(lockup2);
			}
		}
	};

	// Vesting
	const participateVestingDeposit = async (currency) => {
		console.log('participateVestingDeposit', currency);
		console.log('value', transactionValue);
		console.log('currency', currency);
		// check on values
		if (!isPositiveFloat(transactionValue)) {
			warningNotification(t('Warning.amount.invalid.title'), t('Warning.amount.invalid.desc'));
			return false;
		}

		// convert to BN to do the deposit
		let bnValue = new bn(transactionValue).times(mantissa).toFixed(0);
		console.log('valueBN', bnValue);

		if (currency === 'ovrg') {
			// Check Allowance
			let allowanceOVRG = await web3Context.state.tokenOVRGViewer.allowance(
				web3Context.state.address,
				config.apis.VestingOVRG,
			);
			allowanceOVRG = parseFloat(ethers.utils.formatEther(allowanceOVRG).toString()).toFixed(2);
			console.log('allowanceOVRG', allowanceOVRG);
			if (allowanceOVRG < parseFloat(transactionValue)) {
				warningNotification(t('Warning.allowance.invalid.title'), t('Warning.allowance.invalid.desc'));
				return false;
			}
			// Partecipate
			let depositOVRG = await web3Context.state.VestOVRGSigner.deposit(bnValue);
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
		if (currency === 'ovrg15') {
			// Check Allowance
			let allowanceOVRG15 = await web3Context.state.tokenOVRG15Viewer.allowance(
				web3Context.state.address,
				config.apis.VestingOVRG15,
			);
			allowanceOVRG15 = parseFloat(ethers.utils.formatEther(allowanceOVRG15).toString()).toFixed(2);
			if (allowanceOVRG15 < parseFloat(transactionValue)) {
				warningNotification(t('Warning.allowance.invalid.title'), t('Warning.allowance.invalid.desc'));
				return false;
			}
			// Partecipate
			let depositOVRG15 = await web3Context.state.VestOVRG15Signer.deposit(bnValue);
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
		if (currency === 'ovrg30') {
			// Check Allowance
			let allowanceOVRG30 = await web3Context.state.tokenOVRG30Viewer.allowance(
				web3Context.state.address,
				config.apis.VestingOVRG30,
			);
			allowanceOVRG30 = parseFloat(ethers.utils.formatEther(allowanceOVRG30).toString()).toFixed(2);
			if (allowanceOVRG30 < parseFloat(transactionValue)) {
				warningNotification(t('Warning.allowance.invalid.title'), t('Warning.allowance.invalid.desc'));
				return false;
			}
			// Partecipate
			let depositOVRG30 = await web3Context.state.VestOVRG30Signer.deposit(bnValue);
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
	};

	const participateVestingClaim = async (currency) => {
		console.log('participateVestingClaim', currency);
		console.log('value', transactionValue);
		console.log('lockup', lockup);

		if (currency === 'ovrg') {
			let claimOVRG = await web3Context.state.VestOVRGSigner.unlockVestedTokens();
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
		if (currency === 'ovrg15') {
			let claimOVRG = await web3Context.state.VestOVRG15Signer.unlockVestedTokens();
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
		if (currency === 'ovrg30') {
			let claimOVRG = await web3Context.state.VestOVRG30Signer.unlockVestedTokens();
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
	};

	const allowanceDeposit = async (currency) => {
		console.log('participateVestingClaim', currency);
		console.log('value', transactionValue);
		console.log('lockup', lockup);
		console.log('Wallet: ', web3Context.state.address);
		let ovrgAddress = await web3Context.state.VestOVRGViewer.ovrg();
		let ovrg = '10000000';
		const howMuchTokens = ethers.utils.parseUnits(ovrg, 18);

		if (currency === 'ovrg') {
			let approve = await web3Context.state.tokenOVRGSigner.approve(
				config.apis.VestingOVRG,
				new bn(ovrg).times(mantissa).toFixed(0),
			);
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
		if (currency === 'ovrg15') {
			let approve = await web3Context.state.tokenOVRG15Signer.approve(
				config.apis.VestingOVRG15,
				new bn(ovrg).times(mantissa).toFixed(0),
			);
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
		if (currency === 'ovrg30') {
			let approve = await web3Context.state.tokenOVRG30Signer.approve(
				config.apis.VestingOVRG30,
				new bn(ovrg).times(mantissa).toFixed(0),
			);
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
	};

	const allowanceStaking = async (currency) => {
		console.log('participateVestingClaim', currency);
		console.log('value', transactionValue);
		console.log('lockup', lockup);
		console.log('Wallet: ', web3Context.state.address);
		let ovrgAddress = await web3Context.state.VestOVRGViewer.ovrg();
		let ovrg = '10000000';
		const howMuchTokens = ethers.utils.parseUnits(ovrg, 18);

		if (currency === 'ovr') {
			let approve = await web3Context.state.ibcoRewardSigner.approve(
				config.apis.stakingOVR,
				new bn(ovrg).times(mantissa).toFixed(0),
			);
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
		if (currency === 'ovrg') {
			let approve = await web3Context.state.OVRGSigner.approve(
				config.apis.stakingOVRG,
				new bn(ovrg).times(mantissa).toFixed(0),
			);
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
		if (currency === 'ovrg15') {
			let approve = await web3Context.state.OVRG15Signer.approve(
				config.apis.stakingOVRG15,
				new bn(ovrg).times(mantissa).toFixed(0),
			);
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
		if (currency === 'ovrg30') {
			let approve = await web3Context.state.OVRG30Signer.approve(
				config.apis.stakingOVRG30,
				new bn(ovrg).times(mantissa).toFixed(0),
			);
			successNotification(t('IBCO.request.process.title'), t('IBCO.request.process.desc'));
		}
	};
	// Example
	const handleApprove = async (val) => {
		//let test = await web3Context.state.vestingOVRGViewer.deposit(100);
		// let approve = await web3Context.state.ibcoDAISigner.approve(
		// 		config.apis.curveAddress,
		// 		new bn(val).times(mantissa).toFixed(0)
		// );
		// successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))
	};

	const renderSubTabVesting = () => {
		if (subTab == 'ovrg') {
			return (
				<>
					<div className="o-row">
						<div className="o-row --value-header">
							<div className="o-one-label">
								<div className="o-label">{t('Vesting.total')}</div>
								<div className="o-value">
									<ValueCounter value={vestingValues[0]} currency="ovr"></ValueCounter>
								</div>
							</div>
							<div className="o-one-label">
								<div className="o-label">{t('Vesting.total.vested')}</div>
								<div className="o-value">
									<ValueCounter value={vestingValues[1]} currency="ovr"></ValueCounter>
								</div>
							</div>
							<div className="o-one-label">
								<div className="o-label">{t('Vesting.total.claimed')}</div>
								<div className="o-value">
									<ValueCounter value={vestingValues[2]} currency="ovr"></ValueCounter>
								</div>
							</div>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row o-flow-root">
							<h3 className="c-section-title">{t('Stacking.convert', { token: 'OVRG' })}</h3>
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
									handleTransactionValueChange(e.target.value);
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
								text={t('Stacking.convert', { token: 'OVRG' })}
								className={`--orange --large --kyc-button --only-butt`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => participateVestingDeposit('ovrg')}
							></HexButton>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row">
							<h3 className="c-section-title">{t('Vesting.claim', { token: 'OVR' })}</h3>
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
			);
		}
		if (subTab == 'ovrg15') {
			return (
				<>
					<div className="o-row">
						<div className="o-row --value-header">
							<div className="o-one-label">
								<div className="o-label">{t('Vesting.total')}</div>
								<div className="o-value">
									<ValueCounter value={vestingValues[3]} currency="ovr"></ValueCounter>
								</div>
							</div>
							<div className="o-one-label">
								<div className="o-label">{t('Vesting.total.vested')}</div>
								<div className="o-value">
									<ValueCounter value={vestingValues[4]} currency="ovr"></ValueCounter>
								</div>
							</div>
							<div className="o-one-label">
								<div className="o-label">{t('Vesting.total.claimed')}</div>
								<div className="o-value">
									<ValueCounter value={vestingValues[5]} currency="ovr"></ValueCounter>
								</div>
							</div>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row o-flow-root">
							<h3 className="c-section-title">{t('Stacking.convert', { token: 'OVRG15' })}</h3>
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
									handleTransactionValueChange(e.target.value);
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
								text={t('Stacking.convert', { token: 'OVRG15' })}
								className={`--orange --large --kyc-button --only-butt`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => participateVestingDeposit('ovrg15')}
							></HexButton>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row">
							<h3 className="c-section-title">{t('Vesting.claim', { token: 'OVR' })}</h3>
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
			);
		}
		if (subTab == 'ovrg30') {
			return (
				<>
					<div className="o-row">
						<div className="o-row --value-header">
							<div className="o-one-label">
								<div className="o-label">{t('Vesting.total')}</div>
								<div className="o-value">
									<ValueCounter value={vestingValues[6]} currency="ovr"></ValueCounter>
								</div>
							</div>
							<div className="o-one-label">
								<div className="o-label">{t('Vesting.total.vested')}</div>
								<div className="o-value">
									<ValueCounter value={vestingValues[7]} currency="ovr"></ValueCounter>
								</div>
							</div>
							<div className="o-one-label">
								<div className="o-label">{t('Vesting.total.claimed')}</div>
								<div className="o-value">
									<ValueCounter value={vestingValues[8]} currency="ovr"></ValueCounter>
								</div>
							</div>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row o-flow-root">
							<h3 className="c-section-title">{t('Stacking.convert', { token: 'OVRG30' })}</h3>
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
									handleTransactionValueChange(e.target.value);
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
								text={t('Stacking.convert', { token: 'OVRG30' })}
								className={`--orange --large --kyc-button --only-butt`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => participateVestingDeposit('ovrg30')}
							></HexButton>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row">
							<h3 className="c-section-title">{t('Vesting.claim', { token: 'OVR' })}</h3>
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
			);
		}
	};

	const renderSubTabStacking = () => {
		if (subTab == 'ovr') {
			return (
				<>
					<div className="o-row">
						<div className="o-row --value-header">
							<div className="o-one-label">
								<div className="o-label">{t('Stacking.total')}</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVR[0]}
										currency="ovr"
										text={t('Stacking.lockup.0')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVR[1]}
										currency="ovr"
										text={t('Stacking.lockup.3')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVR[2]}
										currency="ovr"
										text={t('Stacking.lockup.6')}
									></ValueCounter>
								</div>
							</div>
							<div className="o-one-label">
								<div className="o-label">{t('Stacking.total.rewards')}</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVR[3]}
										currency="ovr"
										text={t('Stacking.lockup.0')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVR[4]}
										currency="ovr"
										text={t('Stacking.lockup.3')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVR[5]}
										currency="ovr"
										text={t('Stacking.lockup.6')}
									></ValueCounter>
								</div>
							</div>
							<div className="o-one-label">
								<div className="o-label">{t('Stacking.claimed.rewards')}</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVR[6]}
										currency="ovr"
										text={t('Stacking.lockup.0')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVR[7]}
										currency="ovr"
										text={t('Stacking.lockup.3')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVR[8]}
										currency="ovr"
										text={t('Stacking.lockup.6')}
									></ValueCounter>
								</div>
							</div>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row">
							<h3 className="c-section-title">{t('Stacking.deposit', { token: 'OVR' })}</h3>
						</div>
						<div className="o-row">
							<b>{t('Stacking.lockup')}:</b>
							<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>{t('Stacking.lockup.no')}</ToggleButton>
								<ToggleButton value={3}>{t('Stacking.lockup.3')}</ToggleButton>
								<ToggleButton value={6}>{t('Stacking.lockup.6')}</ToggleButton>
							</ToggleButtonGroup>
						</div>
						<div className="o-row --apy">
							<b>{t('Stacking.apy')}:</b>
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
									handleTransactionValueChange(e.target.value);
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
								text={t('Stacking.deposit', { token: 'OVR' })}
								className={`--orange --large --kyc-button --only-butt`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => participateStackingDeposit('ovr')}
							></HexButton>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row">
							<h3 className="c-section-title">{t('Stacking.claim.capital', { token: 'OVR' })}</h3>
						</div>
						<div className="o-row o-flow-root">
							<div className="o-row">
								<b>{t('Stacking.lockup')}:</b>
								<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
									<ToggleButton value={0}>{t('Stacking.lockup.no')}</ToggleButton>
									<ToggleButton value={3}>{t('Stacking.lockup.3')}</ToggleButton>
									<ToggleButton value={6}>{t('Stacking.lockup.6')}</ToggleButton>
								</ToggleButtonGroup>
							</div>
							<div className="o-row --apy">
								<b>{t('Stacking.apy')}:</b>
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
										handleTransactionValueChange(e.target.value);
									}}
								/>
							</div>
							<div className="o-half">
								<HexButton
									url="#"
									text={t('Stacking.claim.capital', { token: 'OVR' })}
									className={`--orange --large --kyc-button --only-butt`}
									// ${bidValid ? '' : '--disabled'}
									onClick={() => participateStackingClaim('capital', 'ovr')}
								></HexButton>
							</div>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row o-flow-root">
							<h3 className="c-section-title">{t('Stacking.claim.rewards', { token: 'OVR' })}</h3>
						</div>
						<div className="o-row">
							<b>{t('Stacking.lockup')}:</b>
							<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>{t('Stacking.lockup.no')}</ToggleButton>
								<ToggleButton value={3}>{t('Stacking.lockup.3')}</ToggleButton>
								<ToggleButton value={6}>{t('Stacking.lockup.6')}</ToggleButton>
							</ToggleButtonGroup>
						</div>
						<div className="o-row --apy">
							<b>{t('Stacking.apy')}:</b>
							<div>
								{lockup === 0 ? '5%' : ''}
								{lockup === 3 ? '10%' : ''}
								{lockup === 6 ? '15%' : ''}
							</div>
						</div>
						<div className="o-row">
							<HexButton
								url="#"
								text={t('Stacking.claim.rewards', { token: 'OVR' })}
								className={`--orange --large --kyc-button --only-butt`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => participateStackingClaim('stakes', 'ovr')}
							></HexButton>
						</div>
					</div>
				</>
			);
		}
		if (subTab == 'ovrg') {
			return (
				<>
					<div className="o-row">
						<div className="o-row --value-header">
							<div className="o-one-label">
								<div className="o-label">{t('Stacking.total')}</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG[0]}
										currency="ovr"
										text={t('Stacking.lockup.0')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG[1]}
										currency="ovr"
										text={t('Stacking.lockup.3')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG[2]}
										currency="ovr"
										text={t('Stacking.lockup.6')}
									></ValueCounter>
								</div>
							</div>
							<div className="o-one-label">
								<div className="o-label">{t('Stacking.total.rewards')}</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG[3]}
										currency="ovr"
										text={t('Stacking.lockup.0')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG[4]}
										currency="ovr"
										text={t('Stacking.lockup.3')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG[5]}
										currency="ovr"
										text={t('Stacking.lockup.6')}
									></ValueCounter>
								</div>
							</div>
							<div className="o-one-label">
								<div className="o-label">{t('Stacking.claimed.rewards')}</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG[6]}
										currency="ovr"
										text={t('Stacking.lockup.0')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG[7]}
										currency="ovr"
										text={t('Stacking.lockup.3')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG[8]}
										currency="ovr"
										text={t('Stacking.lockup.6')}
									></ValueCounter>
								</div>
							</div>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row">
							<h3 className="c-section-title">{t('Stacking.deposit', { token: 'OVRG' })}</h3>
						</div>
						<div className="o-row">
							<b>{t('Stacking.lockup')}:</b>
							<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>{t('Stacking.lockup.no')}</ToggleButton>
								<ToggleButton value={3}>{t('Stacking.lockup.3')}</ToggleButton>
								<ToggleButton value={6}>{t('Stacking.lockup.6')}</ToggleButton>
							</ToggleButtonGroup>
						</div>
						<div className="o-row --apy">
							<b>{t('Stacking.apy')}:</b>
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
									handleTransactionValueChange(e.target.value);
								}}
							/>
						</div>
						<div className="o-half">
							<HexButton
								url="#"
								text={t('Stacking.deposit', { token: 'OVRG' })}
								className={`--orange --large --kyc-button --only-butt`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => participateStackingDeposit('ovrg')}
							></HexButton>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row">
							<h3 className="c-section-title">{t('Stacking.claim.capital', { token: 'OVRG' })}</h3>
						</div>
						<div className="o-row o-flow-root">
							<div className="o-row">
								<b>{t('Stacking.lockup')}:</b>
								<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
									<ToggleButton value={0}>{t('Stacking.lockup.no')}</ToggleButton>
									<ToggleButton value={3}>{t('Stacking.lockup.3')}</ToggleButton>
									<ToggleButton value={6}>{t('Stacking.lockup.6')}</ToggleButton>
								</ToggleButtonGroup>
							</div>
							<div className="o-row --apy">
								<b>{t('Stacking.apy')}:</b>
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
										handleTransactionValueChange(e.target.value);
									}}
								/>
							</div>
							<div className="o-half">
								<HexButton
									url="#"
									text={t('Stacking.claim.capital', { token: 'OVRG' })}
									className={`--orange --large --kyc-button --only-butt`}
									// ${bidValid ? '' : '--disabled'}
									onClick={() => participateStackingClaim('capital', 'ovrg')}
								></HexButton>
							</div>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row o-flow-root">
							<h3 className="c-section-title">{t('Stacking.claim.rewards', { token: 'OVR' })}</h3>
						</div>
						<div className="o-row">
							<b>{t('Stacking.lockup')}:</b>
							<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>{t('Stacking.lockup.no')}</ToggleButton>
								<ToggleButton value={3}>{t('Stacking.lockup.3')}</ToggleButton>
								<ToggleButton value={6}>{t('Stacking.lockup.6')}</ToggleButton>
							</ToggleButtonGroup>
						</div>
						<div className="o-row --apy">
							<b>{t('Stacking.apy')}:</b>
							<div>
								{lockup === 0 ? '10%' : ''}
								{lockup === 3 ? '20%' : ''}
								{lockup === 6 ? '30%' : ''}
							</div>
						</div>
						<div className="o-row">
							<HexButton
								url="#"
								text={t('Stacking.claim.rewards', { token: 'OVR' })}
								className={`--orange --large --kyc-button --only-butt`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => participateStackingClaim('stakes', 'ovrg')}
							></HexButton>
						</div>
					</div>
				</>
			);
		}
		if (subTab == 'ovrg15') {
			return (
				<>
					<div className="o-row">
						<div className="o-row --value-header">
							<div className="o-one-label">
								<div className="o-label">{t('Stacking.total')}</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG15[0]}
										currency="ovr"
										text={t('Stacking.lockup.0')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG15[1]}
										currency="ovr"
										text={t('Stacking.lockup.3')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG15[2]}
										currency="ovr"
										text={t('Stacking.lockup.6')}
									></ValueCounter>
								</div>
							</div>
							<div className="o-one-label">
								<div className="o-label">{t('Stacking.total.rewards')}</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG15[3]}
										currency="ovr"
										text={t('Stacking.lockup.0')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG15[4]}
										currency="ovr"
										text={t('Stacking.lockup.3')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG15[5]}
										currency="ovr"
										text={t('Stacking.lockup.6')}
									></ValueCounter>
								</div>
							</div>
							<div className="o-one-label">
								<div className="o-label">{t('Stacking.claimed.rewards')}</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG15[6]}
										currency="ovr"
										text={t('Stacking.lockup.0')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG15[7]}
										currency="ovr"
										text={t('Stacking.lockup.3')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG15[8]}
										currency="ovr"
										text={t('Stacking.lockup.6')}
									></ValueCounter>
								</div>
							</div>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row">
							<h3 className="c-section-title">{t('Stacking.deposit', { token: 'OVRG15' })}</h3>
						</div>
						<div className="o-row">
							<b>{t('Stacking.lockup')}:</b>
							<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>{t('Stacking.lockup.no')}</ToggleButton>
								<ToggleButton value={3}>{t('Stacking.lockup.3')}</ToggleButton>
								<ToggleButton value={6}>{t('Stacking.lockup.6')}</ToggleButton>
							</ToggleButtonGroup>
						</div>
						<div className="o-row --apy">
							<b>{t('Stacking.apy')}:</b>
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
									handleTransactionValueChange(e.target.value);
								}}
							/>
						</div>
						<div className="o-half">
							<HexButton
								url="#"
								text={t('Stacking.deposit', { token: 'OVRG15' })}
								className={`--orange --large --kyc-button --only-butt`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => participateStackingDeposit('ovrg15')}
							></HexButton>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row">
							<h3 className="c-section-title">{t('Stacking.claim.capital', { token: 'OVRG15' })}</h3>
						</div>
						<div className="o-row o-flow-root">
							<div className="o-row">
								<b>{t('Stacking.lockup')}:</b>
								<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
									<ToggleButton value={0}>{t('Stacking.lockup.no')}</ToggleButton>
									<ToggleButton value={3}>{t('Stacking.lockup.3')}</ToggleButton>
									<ToggleButton value={6}>{t('Stacking.lockup.6')}</ToggleButton>
								</ToggleButtonGroup>
							</div>
							<div className="o-row --apy">
								<b>{t('Stacking.apy')}:</b>
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
										handleTransactionValueChange(e.target.value);
									}}
								/>
							</div>
							<div className="o-half">
								<HexButton
									url="#"
									text={t('Stacking.claim.capital', { token: 'OVRG15' })}
									className={`--orange --large --kyc-button --only-butt`}
									// ${bidValid ? '' : '--disabled'}
									onClick={() => participateStackingClaim('capital', 'ovrg15')}
								></HexButton>
							</div>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row o-flow-root">
							<h3 className="c-section-title">{t('Stacking.claim.rewards', { token: 'OVR' })}</h3>
						</div>
						<div className="o-row">
							<b>{t('Stacking.lockup')}:</b>
							<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>{t('Stacking.lockup.no')}</ToggleButton>
								<ToggleButton value={3}>{t('Stacking.lockup.3')}</ToggleButton>
								<ToggleButton value={6}>{t('Stacking.lockup.6')}</ToggleButton>
							</ToggleButtonGroup>
						</div>
						<div className="o-row --apy">
							<b>{t('Stacking.apy')}:</b>
							<div>
								{lockup === 0 ? '10%' : ''}
								{lockup === 3 ? '20%' : ''}
								{lockup === 6 ? '30%' : ''}
							</div>
						</div>
						<div className="o-row">
							<HexButton
								url="#"
								text={t('Stacking.claim.rewards', { token: 'OVR' })}
								className={`--orange --large --kyc-button --only-butt`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => participateStackingClaim('stakes', 'ovrg15')}
							></HexButton>
						</div>
					</div>
				</>
			);
		}
		if (subTab == 'ovrg30') {
			return (
				<>
					<div className="o-row">
						<div className="o-row --value-header">
							<div className="o-one-label">
								<div className="o-label">{t('Stacking.total')}</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG30[0]}
										currency="ovr"
										text={t('Stacking.lockup.0')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG30[1]}
										currency="ovr"
										text={t('Stacking.lockup.3')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG30[2]}
										currency="ovr"
										text={t('Stacking.lockup.6')}
									></ValueCounter>
								</div>
							</div>
							<div className="o-one-label">
								<div className="o-label">{t('Stacking.total.rewards')}</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG30[3]}
										currency="ovr"
										text={t('Stacking.lockup.0')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG30[4]}
										currency="ovr"
										text={t('Stacking.lockup.3')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG30[5]}
										currency="ovr"
										text={t('Stacking.lockup.6')}
									></ValueCounter>
								</div>
							</div>
							<div className="o-one-label">
								<div className="o-label">{t('Stacking.claimed.rewards')}</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG30[6]}
										currency="ovr"
										text={t('Stacking.lockup.0')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG30[7]}
										currency="ovr"
										text={t('Stacking.lockup.3')}
									></ValueCounter>
								</div>
								<div className="o-value">
									<ValueCounter
										value={stackingValuesOVRG30[8]}
										currency="ovr"
										text={t('Stacking.lockup.6')}
									></ValueCounter>
								</div>
							</div>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row">
							<h3 className="c-section-title">{t('Stacking.deposit', { token: 'OVRG30' })}</h3>
						</div>
						<div className="o-row">
							<b>{t('Stacking.lockup')}:</b>
							<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>{t('Stacking.lockup.no')}</ToggleButton>
								<ToggleButton value={3}>{t('Stacking.lockup.3')}</ToggleButton>
								<ToggleButton value={6}>{t('Stacking.lockup.6')}</ToggleButton>
							</ToggleButtonGroup>
						</div>
						<div className="o-row --apy">
							<b>{t('Stacking.apy')}:</b>
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
									handleTransactionValueChange(e.target.value);
								}}
							/>
						</div>
						<div className="o-half">
							<HexButton
								url="#"
								text={t('Stacking.deposit', { token: 'OVRG30' })}
								className={`--orange --large --kyc-button --only-butt`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => participateStackingDeposit('ovrg30')}
							></HexButton>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row">
							<h3 className="c-section-title">{t('Stacking.claim.capital', { token: 'OVRG30' })}</h3>
						</div>
						<div className="o-row o-flow-root">
							<div className="o-row">
								<b>{t('Stacking.lockup')}:</b>
								<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
									<ToggleButton value={0}>{t('Stacking.lockup.no')}</ToggleButton>
									<ToggleButton value={3}>{t('Stacking.lockup.3')}</ToggleButton>
									<ToggleButton value={6}>{t('Stacking.lockup.6')}</ToggleButton>
								</ToggleButtonGroup>
							</div>
							<div className="o-row --apy">
								<b>{t('Stacking.apy')}:</b>
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
										handleTransactionValueChange(e.target.value);
									}}
								/>
							</div>
							<div className="o-half">
								<HexButton
									url="#"
									text={t('Stacking.claim.capital', { token: 'OVRG30' })}
									className={`--orange --large --kyc-button --only-butt`}
									// ${bidValid ? '' : '--disabled'}
									onClick={() => participateStackingClaim('capital', 'ovrg30')}
								></HexButton>
							</div>
						</div>
					</div>
					<div className="o-line --venti"></div>
					<div className="o-row o-flow-root">
						<div className="o-row o-flow-root">
							<h3 className="c-section-title">{t('Stacking.claim.rewards', { token: 'OVR' })}</h3>
						</div>
						<div className="o-row">
							<b>{t('Stacking.lockup')}:</b>
							<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>{t('Stacking.lockup.no')}</ToggleButton>
								<ToggleButton value={3}>{t('Stacking.lockup.3')}</ToggleButton>
								<ToggleButton value={6}>{t('Stacking.lockup.6')}</ToggleButton>
							</ToggleButtonGroup>
						</div>
						<div className="o-row --apy">
							<b>{t('Stacking.apy')}:</b>
							<div>
								{lockup === 0 ? '10%' : ''}
								{lockup === 3 ? '20%' : ''}
								{lockup === 6 ? '30%' : ''}
							</div>
						</div>
						<div className="o-row">
							<HexButton
								url="#"
								text={t('Stacking.claim.rewards', { token: 'OVR' })}
								className={`--orange --large --kyc-button --only-butt`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => participateStackingClaim('stakes', 'ovrg30')}
							></HexButton>
						</div>
					</div>
				</>
			);
		}
	};

	const renderTab = () => {
		if (tab == 'vesting') {
			return (
				<>
					<div className="o-row">
						<div className="c-sub-tab-selector_cont">
							<div
								className={`c-sub-tab-selector ${subTab == 'ovrg' ? '--selected' : ''}`}
								onClick={() => handleSubTabChange('ovrg')}
							>
								OVRG
							</div>
							<div
								className={`c-sub-tab-selector ${subTab == 'ovrg15' ? '--selected' : ''}`}
								onClick={() => {
									handleSubTabChange('ovrg15');
								}}
							>
								OVRG15
							</div>
							<div
								className={`c-sub-tab-selector ${subTab == 'ovrg30' ? '--selected' : ''}`}
								onClick={() => {
									handleSubTabChange('ovrg30');
								}}
							>
								OVRG30
							</div>
						</div>
					</div>
					<div className="o-line --venti"></div>
					{renderSubTabVesting()}
				</>
			);
		} else {
			return (
				<>
					<div className="o-row"></div>
					{renderSubTabStacking()}
				</>
			);
		}
	};

	const StackingContentLoginRequired = () => {
		const { t, i18n } = useTranslation();
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
						<div className="c-dialog-sub-title">{t('Generic.login.required.desc')}</div>
					</div>
				</div>
			</div>
		);
	};

	if (!userAuthenticated) {
		return <StackingContentLoginRequired t={t} />;
	} else {
		return (
			<div className="Stacking">
				<div className="o-container">
					<div className="o-section">
						<div className="o-first">
							<div className="o-card">
								<div className="o-row">
									<h3 className="p-card-title">{t('Stacking.title')}</h3>
								</div>
								<div className="o-row">
									{t('Stacking.desc.copy.ovr')
										.split('\n')
										.reduce((r, c, x) => (r ? [...r, <br key={x} />, c] : [c]), null)}
								</div>
							</div>
						</div>
						<div className="o-second">
							<div className="o-card ">{renderTab()}</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Stacking;
