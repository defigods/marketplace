import React, {useContext} from 'react';
import { useTranslation } from 'react-i18next'
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import HexButton from '../../components/HexButton/HexButton';
import TermsAndConditionsOverlay from '../../components/TermsAndConditionsOverlay/TermsAndConditionsOverlay'
import { Web3Context } from '../../context/Web3Context';
import { UserContext } from '../../context/UserContext';

import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';

import { warningNotification, successNotification} from '../../lib/notifications';
import CircularProgress from '@material-ui/core/CircularProgress';

import { ethers, BigNumber,utils } from 'ethers';
import bn from "bignumber.js";

import config from '../../lib/config';
import {isPositiveFloat} from '../../lib/config';
import { useHistory, Link } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';

import {getCurrentLocale} from '../../i18n';

import Tooltip from '@material-ui/core/Tooltip';
import Help from '@material-ui/icons/Help';


const mantissa = new bn(1e18);

function Stacking() {
	const { t, i18n } = useTranslation();
	const [tab, setTab] = React.useState('stacking');

	const [stackingValuesOVR, setStackingValuesOVR] = React.useState([0,0,0,0,0,0,0,0,0]); // 0-stacking, 0-rewards, 0-claimed, 3-stacking, 3-rewards..
	const [stackingValuesOVRG, setStackingValuesOVRG] = React.useState([0,0,0,0,0,0,0,0,0]); // 0-stacking, 0-rewards, 0-claimed, 3-stacking, 3-rewards..
	const [stackingValuesOVRG15, setStackingValuesOVRG15] = React.useState([0,0,0,0,0,0,0,0,0]); // 0-stacking, 0-rewards, 0-claimed, 3-stacking, 3-rewards..
	const [stackingValuesOVRG30, setStackingValuesOVRG30] = React.useState([0,0,0,0,0,0,0,0,0]); // 0-stacking, 0-rewards, 0-claimed, 3-stacking, 3-rewards..
	const [vestingValues, setVestingValues] = React.useState([0,0,0,0,0,0,0,0,0]); // OVRG-assigned, OVRG-vested, OVRG-claimed, OVRG15-assigned, OVRG15-vested, OVRG15-claimed..

	const [subTab, setSubTab] = React.useState('ovr');
	const [transactionValue, setTransactionValue] = React.useState(0.00);
	const [transactionValueValid, setTransactionValueValid] = React.useState(false);
	const [lockup, setLockup] = React.useState(0);

	let history = useHistory();
	const web3Context = useContext(Web3Context);
	const userContext = useContext(UserContext);
	const [web3IsReady, setWeb3IsReady] = React.useState(false);
	const { isLoggedIn: userAuthenticated } = userContext.state;

	const [ibcoIsKYCPassed, setIbcoIsKYCPassed] = React.useState(false);

	// On Web3Loaded
	React.useEffect(() => {
		if(web3Context.state){
			if(web3Context.state.ibcoSetupComplete){
				if(web3Context.state.ibcoSetupComplete === true){
					setWeb3IsReady(true);
				}
			}
		}
	}, [web3Context]);

	React.useEffect(() => {
		loadVestingDeposit();
		setInterval(() => {
			loadVestingDeposit();
		}, 30000);
	}, [web3IsReady]);

	// Check if terms condition changed from userstate and kyc passed
	React.useEffect(() => {
		if(userContext.state.user.kycReviewAnswer === 1){
			setIbcoIsKYCPassed(true)
		}
	}, [userContext.state.user.kycReviewAnswer]);


	// Interface helpers
	const handleTabChange = (newValue) => {
		setTab(newValue);
		setTransactionValue(0.0);
		setTransactionValueValid(false);
		if(tab === 'vesting'){
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
		setTransactionValueValid(true)
		setTransactionValue(transactionValue);
	};

	const handleChangeLockup = (event, newLockup) => {
			setLockup(newLockup);
	};


	// Stacking
	const participateStackingDeposit = async (currency) =>{
		console.log('participateStackingDeposit', currency)
		console.log('value', transactionValue)
		console.log('lockup', lockup)
		if(currency === "ovr"){
			// setStackingValuesOVR([0,0,2,3,4,5,6,7,8])
		}
		if(currency === "ovrg"){

		}
		if(currency === "ovrg15"){

		}
		if(currency === "ovrg30"){

		}
	}

	const participateStackingClaim = async (kind, currency) =>{
		console.log('participateStackingDeposit', {kind, currency})
		console.log('value', transactionValue)
		console.log('lockup', lockup)

		if(kind === "capital"){
			if(currency === "ovr"){

			}
			if(currency === "ovrg"){

			}
			if(currency === "ovrg15"){

			}
			if(currency === "ovrg30"){

			}
		}
		if(kind === "stakes"){
			if(currency === "ovr"){

			}
			if(currency === "ovrg"){

			}
			if(currency === "ovrg15"){

			}
			if(currency === "ovrg30"){

			}
		}
	}

	const loadVestingDeposit = async () => {
		if(web3Context.state.VestOVRGViewer){
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


		setVestingValues([depOVRGHuman,depOVRGHuman,depOVRGClaimedHuman,
										depOVRG15Human,depOVRG15Human,depOVRG15ClaimedHuman,
										depOVRG30Human,depOVRG30Human,depOVRG30ClaimedHuman]); // OVRG-assigned, OVRG-vested, OVRG-claimed, OVRG15-assigned, OVRG15-vested, OVRG15-claimed..
		}
	}

	// Vesting
	const participateVestingDeposit = async (currency) =>{
		console.log('participateVestingDeposit', currency)
		console.log('value', transactionValue)
		console.log('currency', currency)
		// check on values
		if(!isPositiveFloat(transactionValue)){
			warningNotification(t('Warning.amount.invalid.title'), t('Warning.amount.invalid.desc'));
			return false;
		}

		// convert to BN to do the deposit
		let bnValue=new bn(transactionValue).times(mantissa).toFixed(0)
		console.log('valueBN', bnValue)

		if(currency === "ovrg"){
			// Check Allowance 
			let allowanceOVRG = await web3Context.state.tokenOVRGViewer.allowance(
					web3Context.state.address,
					config.apis.VestingOVRG
			);
			allowanceOVRG = parseFloat(ethers.utils.formatEther(allowanceOVRG).toString()).toFixed(2)
			console.log('allowanceOVRG',allowanceOVRG)
			if(allowanceOVRG < parseFloat(transactionValue)){
				warningNotification(t('Warning.allowance.invalid.title'), t('Warning.allowance.invalid.desc'));
				return false;
			}
			// Partecipate 
			let depositOVRG = await web3Context.state.VestOVRGSigner.deposit(bnValue);
			successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))
		}
		if(currency === "ovrg15"){
			// Check Allowance 
			let allowanceOVRG15 = await web3Context.state.tokenOVRG15Viewer.allowance(
					web3Context.state.address,
					config.apis.VestingOVRG15
			);
			allowanceOVRG15 = parseFloat(ethers.utils.formatEther(allowanceOVRG15).toString()).toFixed(2)
			if(allowanceOVRG15 < parseFloat(transactionValue)){
				warningNotification(t('Warning.allowance.invalid.title'), t('Warning.allowance.invalid.desc'));
				return false;
			}
			// Partecipate 
			let depositOVRG15 = await web3Context.state.VestOVRG15Signer.deposit(bnValue);
			successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))
		}
		if(currency === "ovrg30"){
			// Check Allowance 
			let allowanceOVRG30 = await web3Context.state.tokenOVRG30Viewer.allowance(
					web3Context.state.address,
					config.apis.VestingOVRG30
			);
			allowanceOVRG30 = parseFloat(ethers.utils.formatEther(allowanceOVRG30).toString()).toFixed(2)
			if(allowanceOVRG30 < parseFloat(transactionValue)){
				warningNotification(t('Warning.allowance.invalid.title'), t('Warning.allowance.invalid.desc'));
				return false;
			}
			// Partecipate 
			let depositOVRG30 = await web3Context.state.VestOVRG30Signer.deposit(bnValue);
			successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))
		}
	}

	const participateVestingClaim = async (currency) =>{
		console.log('participateVestingClaim', currency)
		console.log('value', transactionValue)
		console.log('lockup', lockup)

			if(currency === "ovrg"){				
				let claimOVRG = await web3Context.state.VestOVRGSigner.unlockVestedTokens();
				successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))
			}
			if(currency === "ovrg15"){
				let claimOVRG = await web3Context.state.VestOVRG15Signer.unlockVestedTokens();
				successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))
			}
			if(currency === "ovrg30"){
				let claimOVRG = await web3Context.state.VestOVRG30Signer.unlockVestedTokens();
				successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))
			}

	}

	const AllowanceDeposit = async (currency) =>{
		console.log('participateVestingClaim', currency)
		console.log('value', transactionValue)
		console.log('lockup', lockup)

		let ovrgAddress = await web3Context.state.VestOVRGViewer.ovrg();
		let ovrg = "10000000"
		const howMuchTokens = ethers.utils.parseUnits(ovrg, 18)

		if(currency === "ovrg"){
			let approve = await web3Context.state.tokenOVRGSigner.approve(
					config.apis.VestingOVRG,
					new bn(ovrg).times(mantissa).toFixed(0)
			);
			successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))
		}
		if(currency === "ovrg15"){
			let approve = await web3Context.state.tokenOVRG15Signer.approve(
					config.apis.VestingOVRG15,
					new bn(ovrg).times(mantissa).toFixed(0)
			);
			successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))
		}
		if(currency === "ovrg30"){
			let approve = await web3Context.state.tokenOVRG30Signer.approve(
					config.apis.VestingOVRG30,
					new bn(ovrg).times(mantissa).toFixed(0)
			);
			successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))
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
	};

	const renderSubTabVesting = () => {
		if(subTab == 'ovrg'){
			return (
				<>
				<div className="o-row">
					<div className="o-row --value-header">
						<div className="o-one-label">
							<div className="o-label">
								Total Assigned
							</div>
							<div className="o-value">
								<ValueCounter value={vestingValues[0]} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Vested
							</div>
							<div className="o-value">
								<ValueCounter value={vestingValues[1]} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Claimed
							</div>
							<div className="o-value">
								<ValueCounter value={vestingValues[2]} currency="ovr"></ValueCounter>
							</div>
						</div>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row o-flow-root">
						<h3 className="c-section-title">Deposit OVRG</h3>
					</div>
					<div className="i-ibco-input">
						<TextField
						variant="outlined"
						type="number"
						currencySymbol="OVRG"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(e)=> {
							handleTransactionValueChange(e.target.value);
						}}
							/>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"OVRG ALLOWANCE"}
							className={`--orange --large --kyc-button --only-butt`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => AllowanceDeposit('ovrg')}
						></HexButton>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"Deposit OVRG"}
							className={`--orange --large --kyc-button --only-butt`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => participateVestingDeposit('ovrg')}
						></HexButton>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row">
						<h3 className="c-section-title">Claim OVRG</h3>
					</div>
					<div className="o-row o-flow-root">

						<div className="o-row">
							<HexButton
								url="#"
								text={"Claim OVRG"}
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
		if(subTab == 'ovrg15'){
			return (
				<>
				<div className="o-row">
					<div className="o-row --value-header">
						<div className="o-one-label">
							<div className="o-label">
								Total Assigned
							</div>
							<div className="o-value">
								<ValueCounter value={vestingValues[3]} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Vested
							</div>
							<div className="o-value">
								<ValueCounter value={vestingValues[4]} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Claimed
							</div>
							<div className="o-value">
								<ValueCounter value={vestingValues[5]} currency="ovr"></ValueCounter>
							</div>
						</div>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row o-flow-root">
						<h3 className="c-section-title">Deposit OVRG15</h3>
					</div>
					<div className="i-ibco-input">
						<TextField
						variant="outlined"
						type="number"
						currencySymbol="OVRG15"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(e)=> {
							handleTransactionValueChange(e.target.value);
						}}
							/>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"OVRG ALLOWANCE"}
							className={`--orange --large --kyc-button --only-butt`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => AllowanceDeposit('ovrg15')}
						></HexButton>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"Deposit OVRG15"}
							className={`--orange --large --kyc-button --only-butt`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => participateVestingDeposit('ovrg15')}
						></HexButton>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row">
						<h3 className="c-section-title">Claim OVRG15</h3>
					</div>
					<div className="o-row o-flow-root">

						<div className="o-row">
							<HexButton
								url="#"
								text={"Claim OVRG15"}
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
		if(subTab == 'ovrg30'){
			return (
				<>
				<div className="o-row">
					<div className="o-row --value-header">
						<div className="o-one-label">
							<div className="o-label">
								Total Assigned
							</div>
							<div className="o-value">
								<ValueCounter value={vestingValues[6]} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Vested
							</div>
							<div className="o-value">
								<ValueCounter value={vestingValues[7]} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Claimed
							</div>
							<div className="o-value">
								<ValueCounter value={vestingValues[8]} currency="ovr"></ValueCounter>
							</div>
						</div>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row o-flow-root">
						<h3 className="c-section-title">Deposit OVRG30</h3>
					</div>
					<div className="i-ibco-input">
						<TextField
						variant="outlined"
						type="number"
						currencySymbol="OVRG30"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(e)=> {
							handleTransactionValueChange(e.target.value);
						}}
							/>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"OVRG ALLOWANCE"}
							className={`--orange --large --kyc-button --only-butt`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => AllowanceDeposit('ovrg30')}
						></HexButton>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"Deposit OVRG30"}
							className={`--orange --large --kyc-button --only-butt`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => participateVestingDeposit('ovrg30')}
						></HexButton>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row">
						<h3 className="c-section-title">Claim OVRG30</h3>
					</div>
					<div className="o-row o-flow-root">

						<div className="o-row">
							<HexButton
								url="#"
								text={"Claim OVRG30"}
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

	const renderSubTabStacking = () => {
		if(subTab == 'ovr'){
			return (
				<>
				<div className="o-row">
					<div className="o-row --value-header">
						<div className="o-one-label">
							<div className="o-label">
								Total Stacking
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVR[0]} currency="ovr" text="0 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVR[1]} currency="ovr" text="3 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVR[2]} currency="ovr" text="6 Months"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Rewards
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVR[3]} currency="ovr" text="0 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVR[4]} currency="ovr" text="3 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVR[5]} currency="ovr" text="6 Months"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Claimed Rewards
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVR[6]} currency="ovr" text="0 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVR[7]} currency="ovr" text="3 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVR[8]} currency="ovr" text="6 Months"></ValueCounter>
							</div>
						</div>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row">
						<h3 className="c-section-title">Deposit OVR</h3>
					</div>
					<div className="o-row">
						<b>Lockup:</b>
						<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>
									No lockup
								</ToggleButton>
								<ToggleButton value={3}>
									3 months
								</ToggleButton>
								<ToggleButton value={6}>
								 6 months
								</ToggleButton>
						</ToggleButtonGroup>
					</div>
					<div className="o-row --apy">
						<b>APY:</b>
						<div>{lockup === 0 ? "5%":''}{lockup === 3 ? "10%":''}{lockup === 6 ? "15%":''}</div>
					</div>
					<div className="o-half i-ibco-input">
						<TextField
						variant="outlined"
						type="number"
						currencySymbol="OVR"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(e)=> {
							handleTransactionValueChange(e.target.value);
						}}
							/>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"Deposit OVR"}
							className={`--orange --large --kyc-button --only-butt`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => participateStackingDeposit('ovr')}
						></HexButton>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row">
						<h3 className="c-section-title">Claim OVR from Capital</h3>
					</div>
					<div className="o-row o-flow-root">
						<div className="o-row">
							<b>Lockup:</b>
							<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
									<ToggleButton value={0}>
										No lockup
									</ToggleButton>
									<ToggleButton value={3}>
										3 months
									</ToggleButton>
									<ToggleButton value={6}>
									6 months
									</ToggleButton>
							</ToggleButtonGroup>
						</div>
						<div className="o-row --apy">
							<b>APY:</b>
							<div>{lockup === 0 ? "5%":''}{lockup === 3 ? "10%":''}{lockup === 6 ? "15%":''}</div>
						</div>
						<div className="o-half i-ibco-input">
							<TextField
							variant="outlined"
							type="number"
							currencySymbol="OVR"
							minimumValue={"0"}
							decimalCharacter="."
							digitGroupSeparator=","
							onChange={(e)=> {
								handleTransactionValueChange(e.target.value);
							}}
								/>
						</div>
						<div className="o-half">
							<HexButton
								url="#"
								text={"Claim OVR from Capital"}
								className={`--orange --large --kyc-button --only-butt`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => participateStackingClaim('capital','ovr')}
							></HexButton>
						</div>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row o-flow-root">
						<h3 className="c-section-title">Claim OVR from Rewards</h3>
					</div>
					<div className="o-row">
						<b>Lockup:</b>
						<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>
									No lockup
								</ToggleButton>
								<ToggleButton value={3}>
									3 months
								</ToggleButton>
								<ToggleButton value={6}>
								6 months
								</ToggleButton>
						</ToggleButtonGroup>
					</div>
					<div className="o-row --apy">
						<b>APY:</b>
						<div>{lockup === 0 ? "5%":''}{lockup === 3 ? "10%":''}{lockup === 6 ? "15%":''}</div>
					</div>
					<div className="o-half i-ibco-input">
						<TextField
						variant="outlined"
						type="number"
						currencySymbol="OVR"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(e)=> {
							handleTransactionValueChange(e.target.value);
						}}
							/>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"Claim OVR from Rewards"}
							className={`--orange --large --kyc-button --only-butt`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => participateStackingClaim('stakes','ovr')}
						></HexButton>
					</div>
				</div>
				</>
			)
		}
		if(subTab == 'ovrg'){
			return (
				<>
				<div className="o-row">
					<div className="o-row --value-header">
						<div className="o-one-label">
							<div className="o-label">
								Total Stacking
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG[0]} currency="ovr" text="0 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG[1]} currency="ovr" text="3 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG[2]} currency="ovr" text="6 Months"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Rewards
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG[3]} currency="ovr" text="0 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG[4]} currency="ovr" text="3 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG[5]} currency="ovr" text="6 Months"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Claimed Rewards
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG[6]} currency="ovr" text="0 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG[7]} currency="ovr" text="3 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG[8]} currency="ovr" text="6 Months"></ValueCounter>
							</div>
						</div>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row">
						<h3 className="c-section-title">Deposit OVRG</h3>
					</div>
					<div className="o-row">
						<b>Lockup:</b>
						<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>
									No lockup
								</ToggleButton>
								<ToggleButton value={3}>
									3 months
								</ToggleButton>
								<ToggleButton value={6}>
								6 months
								</ToggleButton>
						</ToggleButtonGroup>
					</div>
					<div className="o-row --apy">
						<b>APY:</b>
						<div>{lockup === 0 ? "10%":''}{lockup === 3 ? "20%":''}{lockup === 6 ? "30%":''}</div>
					</div>
					<div className="o-half i-ibco-input">
						<TextField
						variant="outlined"
						type="number"
						currencySymbol="OVRG"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(e)=> {
							handleTransactionValueChange(e.target.value);
						}}
							/>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"Deposit OVRG"}
							className={`--orange --large --kyc-button --only-butt`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => participateStackingDeposit('ovrg')}
						></HexButton>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row">
						<h3 className="c-section-title">Claim OVRG from Capital</h3>
					</div>
					<div className="o-row o-flow-root">
						<div className="o-row">
							<b>Lockup:</b>
							<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
									<ToggleButton value={0}>
										No lockup
									</ToggleButton>
									<ToggleButton value={3}>
										3 months
									</ToggleButton>
									<ToggleButton value={6}>
									6 months
									</ToggleButton>
							</ToggleButtonGroup>
						</div>
						<div className="o-row --apy">
							<b>APY:</b>
							<div>{lockup === 0 ? "10%":''}{lockup === 3 ? "20%":''}{lockup === 6 ? "30%":''}</div>
						</div>
						<div className="o-half i-ibco-input">
							<TextField
							variant="outlined"
							type="number"
							currencySymbol="OVRG"
							minimumValue={"0"}
							decimalCharacter="."
							digitGroupSeparator=","
							onChange={(e)=> {
								handleTransactionValueChange(e.target.value);
							}}
								/>
						</div>
						<div className="o-half">
							<HexButton
								url="#"
								text={"Claim OVRG from Capital"}
								className={`--orange --large --kyc-button --only-butt`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => participateStackingClaim('capital','ovrg')}
							></HexButton>
						</div>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row o-flow-root">
						<h3 className="c-section-title">Claim OVRG from Rewards</h3>
					</div>
					<div className="o-row">
						<b>Lockup:</b>
						<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>
									No lockup
								</ToggleButton>
								<ToggleButton value={3}>
									3 months
								</ToggleButton>
								<ToggleButton value={6}>
								6 months
								</ToggleButton>
						</ToggleButtonGroup>
					</div>
					<div className="o-row --apy">
						<b>APY:</b>
						<div>{lockup === 0 ? "10%":''}{lockup === 3 ? "20%":''}{lockup === 6 ? "30%":''}</div>
					</div>
					<div className="o-half i-ibco-input">
						<TextField
						variant="outlined"
						type="number"
						currencySymbol="OVRG"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(e)=> {
							handleTransactionValueChange(e.target.value);
						}}
							/>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"Claim OVRG from Rewards"}
							className={`--orange --large --kyc-button --only-butt`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => participateStackingClaim('stakes','ovrg')}
						></HexButton>
					</div>
				</div>
				</>
			)
		}
		if(subTab == 'ovrg15'){
			return (
				<>
				<div className="o-row">
					<div className="o-row --value-header">
						<div className="o-one-label">
							<div className="o-label">
								Total Stacking
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG15[0]} currency="ovr" text="0 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG15[1]} currency="ovr" text="3 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG15[2]} currency="ovr" text="6 Months"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Rewards
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG15[3]} currency="ovr" text="0 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG15[4]} currency="ovr" text="3 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG15[5]} currency="ovr" text="6 Months"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Claimed Rewards
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG15[6]} currency="ovr" text="0 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG15[7]} currency="ovr" text="3 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG15[8]} currency="ovr" text="6 Months"></ValueCounter>
							</div>
						</div>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row">
						<h3 className="c-section-title">Deposit OVRG15</h3>
					</div>
					<div className="o-row">
						<b>Lockup:</b>
						<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>
									No lockup
								</ToggleButton>
								<ToggleButton value={3}>
									3 months
								</ToggleButton>
								<ToggleButton value={6}>
								6 months
								</ToggleButton>
						</ToggleButtonGroup>
					</div>
					<div className="o-row --apy">
						<b>APY:</b>
						<div>{lockup === 0 ? "10%":''}{lockup === 3 ? "20%":''}{lockup === 6 ? "30%":''}</div>
					</div>
					<div className="o-half i-ibco-input">
						<TextField
						variant="outlined"
						type="number"
						currencySymbol="OVRG15"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(e)=> {
							handleTransactionValueChange(e.target.value);
						}}
							/>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"Deposit OVRG15"}
							className={`--orange --large --kyc-button --only-butt`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => participateStackingDeposit('ovrg15')}
						></HexButton>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row">
						<h3 className="c-section-title">Claim OVRG15 from Capital</h3>
					</div>
					<div className="o-row o-flow-root">
						<div className="o-row">
							<b>Lockup:</b>
							<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
									<ToggleButton value={0}>
										No lockup
									</ToggleButton>
									<ToggleButton value={3}>
										3 months
									</ToggleButton>
									<ToggleButton value={6}>
									6 months
									</ToggleButton>
							</ToggleButtonGroup>
						</div>
						<div className="o-row --apy">
							<b>APY:</b>
							<div>{lockup === 0 ? "10%":''}{lockup === 3 ? "20%":''}{lockup === 6 ? "30%":''}</div>
						</div>
						<div className="o-half i-ibco-input">
							<TextField
							variant="outlined"
							type="number"
							currencySymbol="OVRG15"
							minimumValue={"0"}
							decimalCharacter="."
							digitGroupSeparator=","
							onChange={(e)=> {
								handleTransactionValueChange(e.target.value);
							}}
								/>
						</div>
						<div className="o-half">
							<HexButton
								url="#"
								text={"Claim OVRG15 from Capital"}
								className={`--orange --large --kyc-button --only-butt`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => participateStackingClaim('capital','ovrg15')}
							></HexButton>
						</div>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row o-flow-root">
						<h3 className="c-section-title">Claim OVRG15 from Rewards</h3>
					</div>
					<div className="o-row">
						<b>Lockup:</b>
						<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>
									No lockup
								</ToggleButton>
								<ToggleButton value={3}>
									3 months
								</ToggleButton>
								<ToggleButton value={6}>
								6 months
					</ToggleButton>
						</ToggleButtonGroup>
					</div>
					<div className="o-row --apy">
						<b>APY:</b>
						<div>{lockup === 0 ? "10%":''}{lockup === 3 ? "20%":''}{lockup === 6 ? "30%":''}</div>
					</div>
					<div className="o-half i-ibco-input">
						<TextField
						variant="outlined"
						type="number"
						currencySymbol="OVRG15"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(e)=> {
							handleTransactionValueChange(e.target.value);
						}}
							/>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"Claim OVRG15 from Rewards"}
							className={`--orange --large --kyc-button --only-butt`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => participateStackingClaim('stakes','ovrg15')}
						></HexButton>
					</div>
				</div>
				</>
			)
		}
		if(subTab == 'ovrg30'){
			return (
				<>
				<div className="o-row">
					<div className="o-row --value-header">
						<div className="o-one-label">
							<div className="o-label">
								Total Stacking
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG30[0]} currency="ovr" text="0 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG30[1]} currency="ovr" text="3 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG30[2]} currency="ovr" text="6 Months"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Rewards
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG30[3]} currency="ovr" text="0 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG30[4]} currency="ovr" text="3 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG30[5]} currency="ovr" text="6 Months"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Claimed Rewards
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG30[6]} currency="ovr" text="0 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG30[7]} currency="ovr" text="3 Months"></ValueCounter>
							</div>
							<div className="o-value">
								<ValueCounter value={stackingValuesOVRG30[8]} currency="ovr" text="6 Months"></ValueCounter>
							</div>
						</div>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row">
						<h3 className="c-section-title">Deposit OVRG30</h3>
					</div>
					<div className="o-row">
						<b>Lockup:</b>
						<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>
									No lockup
								</ToggleButton>
								<ToggleButton value={3}>
									3 months
								</ToggleButton>
								<ToggleButton value={6}>
								6 months
								</ToggleButton>
						</ToggleButtonGroup>
					</div>
					<div className="o-row --apy">
						<b>APY:</b>
						<div>{lockup === 0 ? "10%":''}{lockup === 3 ? "20%":''}{lockup === 6 ? "30%":''}</div>
					</div>
					<div className="o-half i-ibco-input">
						<TextField
						variant="outlined"
						type="number"
						currencySymbol="OVRG30"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(e)=> {
							handleTransactionValueChange(e.target.value);
						}}
							/>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"Deposit OVRG30"}
							className={`--orange --large --kyc-button --only-butt`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => participateStackingDeposit('ovrg30')}
						></HexButton>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row">
						<h3 className="c-section-title">Claim OVRG30 from Capital</h3>
					</div>
					<div className="o-row o-flow-root">
						<div className="o-row">
							<b>Lockup:</b>
							<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
									<ToggleButton value={0}>
										No lockup
									</ToggleButton>
									<ToggleButton value={3}>
										3 months
									</ToggleButton>
									<ToggleButton value={6}>
									6 months
									</ToggleButton>
							</ToggleButtonGroup>
						</div>
						<div className="o-row --apy">
						<b>APY:</b>
						<div>{lockup === 0 ? "10%":''}{lockup === 3 ? "20%":''}{lockup === 6 ? "30%":''}</div>
					</div>
						<div className="o-half i-ibco-input">
							<TextField
							variant="outlined"
							type="number"
							currencySymbol="OVRG30"
							minimumValue={"0"}
							decimalCharacter="."
							digitGroupSeparator=","
							onChange={(e)=> {
								handleTransactionValueChange(e.target.value);
							}}
								/>
						</div>
						<div className="o-half">
							<HexButton
								url="#"
								text={"Claim OVRG30 from Capital"}
								className={`--orange --large --kyc-button --only-butt`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => participateStackingClaim('capital','ovrg30')}
							></HexButton>
						</div>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row o-flow-root">
						<h3 className="c-section-title">Claim OVRG30 from Rewards</h3>
					</div>
					<div className="o-row">
						<b>Lockup:</b>
						<ToggleButtonGroup size="small" value={lockup} exclusive onChange={handleChangeLockup}>
								<ToggleButton value={0}>
									No lockup
								</ToggleButton>
								<ToggleButton value={3}>
									3 months
								</ToggleButton>
								<ToggleButton value={6}>
								6 months
								</ToggleButton>
						</ToggleButtonGroup>
					</div>
					<div className="o-row --apy">
						<b>APY:</b>
						<div>{lockup === 0 ? "10%":''}{lockup === 3 ? "20%":''}{lockup === 6 ? "30%":''}</div>
					</div>
					<div className="o-half i-ibco-input">
						<TextField
						variant="outlined"
						type="number"
						currencySymbol="OVRG30"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(e)=> {
							handleTransactionValueChange(e.target.value);
						}}
							/>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"Claim OVRG30 from Rewards"}
							className={`--orange --large --kyc-button --only-butt`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => participateStackingClaim('stakes','ovrg30')}
						></HexButton>
					</div>
				</div>
				</>
			)
		}
	}

	const renderTab = () => {
		if(tab == 'vesting'){
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
								onClick={() => {handleSubTabChange('ovrg15')}}
						>
							OVRG15
						</div>
						<div
								className={`c-sub-tab-selector ${subTab == 'ovrg30' ? '--selected' : ''}`}
								onClick={() => {handleSubTabChange('ovrg30')}}
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
				<div className="o-row">
					<div className="c-sub-tab-selector_cont">
						<div
								className={`c-sub-tab-selector ${subTab == 'ovr' ? '--selected' : ''}`}
								onClick={() => handleSubTabChange('ovr')}
						>
							OVR
						</div>
						<div
								className={`c-sub-tab-selector ${subTab == 'ovrg' ? '--selected' : ''}`}
								onClick={() => handleSubTabChange('ovrg')}
						>
							OVRG
						</div>
						<div
								className={`c-sub-tab-selector ${subTab == 'ovrg15' ? '--selected' : ''}`}
								onClick={() => {handleSubTabChange('ovrg15')}}
						>
							OVRG15
						</div>
						<div
								className={`c-sub-tab-selector ${subTab == 'ovrg30' ? '--selected' : ''}`}
								onClick={() => {handleSubTabChange('ovrg30')}}
						>
							OVRG30
						</div>
					</div>
				</div>
				<div className="o-line --venti"></div>
				{renderSubTabStacking()}
				</>
			)
		}
	}

	const StackingContentLoginRequired = () => {
		const { t, i18n } = useTranslation();
		return (
			<div className="profile">
			<div className="o-container">
				<div className="c-dialog --centered">
					<div className="c-dialog-main-title">
						{t('Stacking.login.required.title')}
						<span role="img" aria-label="Cool dude">
							😎
						</span>
					</div>
					<div className="c-dialog-sub-title">{t('Stacking.login.required.desc')}</div>
				</div>
			</div>
		</div>
		)
	};

	if (!userAuthenticated) {
		return <StackingContentLoginRequired t={t}/>;
	} else {
		return (
			<div className="Stacking">
				<div className="o-container">
						<div className="o-section">
							<div className="o-half">
								<div className="o-card">
									<div className="o-row">
										<h3 className="p-card-title">Stacking</h3>
									</div>
									<div className="o-row">
										There are 3 different staking options you can select: no lockup with 10% APY, 3 months lockup with 20% APY and 6 months lockup with 30% APY. <br></br><br></br>
										With no lockup option you can claim both capital and rewards at any moment, rewards will keep accruing for as long as you matain your capital stacked <br></br><br></br>
										With 3 and 6 months lockup options capital will be locked until the end of the selected period while you'll be able to withdraw rewards at any moment. Once the staking period (3 or 6 months) ends you will have to withdraw and stake your capital again in order to continue earning rewards. <br></br><br></br>
										Total staking, total rewards hystorically earned and total claimed rewards are detailed for each of the available staking periods<br></br><br></br><br></br>
									</div>
									<div className="o-row">
										<h3 className="p-card-title">Vesting</h3>
									</div>
									<div className="o-row">
										Select the OVRGn token type yuo own (OVRG, OVRG15, OVRG30)<br></br><br></br>
										Select the amount of tokens you want to start vesting and click deposit. Pay attention this is a one way action, once deposited you will not be able to withdraw OVRGn tokens anymore and benefit of double staking rewards.<br></br><br></br>
										Total Assigned: the total number of OVR tokens assigned to your address. 1:1 ratio with deposited OVRGn tokens.<br></br><br></br>
										Total Vested: total number of OVR tokens that has already vested. Includes already claimed.<br></br><br></br>
										Total Claimed: total amount of vested OVR tokens claimed.<br></br><br></br>
									</div>
								</div>
							</div>
								<div className="o-half">
									<div className="o-card ">
											<div className="o-row">
												<div className="c-transaction-selector_cont">
													<div
															className={`c-transaction-selector ${tab == 'stacking' ? '--selected' : ''}`}
															onClick={() => handleTabChange('stacking')}
													>
														Stacking
													</div>
													<div
															className={`c-transaction-selector --second ${tab == 'vesting' ? '--selected' : ''}`}
															onClick={() => {handleTabChange('vesting')}}
													>
														Vesting
													</div>
												</div>
											</div>
											{renderTab()}
									</div>
								</div>
						</div>
				</div>
			</div>
		);
	}
}

export default Stacking;
