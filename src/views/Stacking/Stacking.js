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
import { useHistory, Link } from 'react-router-dom';

import CurrencyTextField from '@unicef/material-ui-currency-textfield'
import TextField from '@material-ui/core/TextField';

import {getCurrentLocale} from '../../i18n';

import Tooltip from '@material-ui/core/Tooltip';
import Help from '@material-ui/icons/Help';


function Stacking() {
	const { t, i18n } = useTranslation();
	const [tab, setTab] = React.useState('stacking');
	const [subTab, setSubTab] = React.useState('ovr');
	const [transactionValue, setTransactionValue] = React.useState(0.00);
	const [transactionValueValid, setTransactionValueValid] = React.useState(false);
	const [lockup, setLockup] = React.useState(0);

	let history = useHistory();
	const web3Context = useContext(Web3Context);
	const userContext = useContext(UserContext);
	const { isLoggedIn: userAuthenticated } = userContext.state;

	const [ibcoIsKYCPassed, setIbcoIsKYCPassed] = React.useState(false);


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

	// Vesting
	const participateVestingDeposit = async (currency) =>{
		console.log('participateVestingDeposit', currency)
		console.log('value', transactionValue)
		console.log('lockup', lockup)

		if(currency === "ovrg"){

		}
		if(currency === "ovrg15"){

		}
		if(currency === "ovrg30"){

		}
	}

	const participateVestingClaim = async (kind, currency) =>{
		console.log('participateVestingClaim', {kind, currency})
		console.log('value', transactionValue)
		console.log('lockup', lockup)
		
		if(kind === "capital"){
			if(currency === "ovrg"){

			}
			if(currency === "ovrg15"){

			}
			if(currency === "ovrg30"){

			}
		}
		if(kind === "stakes"){
			if(currency === "ovrg"){

			}
			if(currency === "ovrg15"){

			}
			if(currency === "ovrg30"){

			}
		}
	}


	// Example
	const handleApprove = async (val) => {
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
								Total Stacking															 
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Stakes
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Claimed Stakes
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row o-flow-root">
						<h3 className="c-section-title">Deposit OVRG</h3>
					</div>
					<div className="o-half i-ibco-input">
						<CurrencyTextField
						variant="outlined"
						currencySymbol="OVRG"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(event, value)=> {
							if(value>0){handleTransactionValueChange(value)};
						}}
							/>
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
								Total Stacking															 
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Stakes
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Claimed Stakes
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row o-flow-root">
						<h3 className="c-section-title">Deposit OVRG15</h3>
					</div>
					<div className="o-half i-ibco-input">
						<CurrencyTextField
						variant="outlined"
						currencySymbol="OVRG15"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(event, value)=> {
							if(value>0){handleTransactionValueChange(value)};
						}}
							/>
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
								Total Stacking															 
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Stakes
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Claimed Stakes
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
					</div>
				</div>
				<div className="o-line --venti"></div>
				<div className="o-row o-flow-root">
					<div className="o-row o-flow-root">
						<h3 className="c-section-title">Deposit OVRG30</h3>
					</div>
					<div className="o-half i-ibco-input">
						<CurrencyTextField
						variant="outlined"
						currencySymbol="OVRG30"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(event, value)=> {
							if(value>0){handleTransactionValueChange(value)};
						}}
							/>
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
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Stakes
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Claimed Stakes
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
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
					<div className="o-half i-ibco-input">
						<CurrencyTextField
						variant="outlined"
						currencySymbol="OVR"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(event, value)=> {
							if(value>0){handleTransactionValueChange(value)};
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
						<div className="o-half i-ibco-input">
							<CurrencyTextField
							variant="outlined"
							currencySymbol="OVR"
							minimumValue={"0"}
							decimalCharacter="."
							digitGroupSeparator=","
							onChange={(event, value)=> {
								if(value>0){handleTransactionValueChange(value)};
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
						<h3 className="c-section-title">Claim OVR from Stakes</h3>
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
					<div className="o-half i-ibco-input">
						<CurrencyTextField
						variant="outlined"
						currencySymbol="OVR"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(event, value)=> {
							if(value>0){handleTransactionValueChange(value)};
						}}
							/>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"Claim OVR from Stakes"}
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
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Stakes
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Claimed Stakes
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
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
					<div className="o-half i-ibco-input">
						<CurrencyTextField
						variant="outlined"
						currencySymbol="OVRG"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(event, value)=> {
							if(value>0){handleTransactionValueChange(value)};
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
						<div className="o-half i-ibco-input">
							<CurrencyTextField
							variant="outlined"
							currencySymbol="OVRG"
							minimumValue={"0"}
							decimalCharacter="."
							digitGroupSeparator=","
							onChange={(event, value)=> {
								if(value>0){handleTransactionValueChange(value)};
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
						<h3 className="c-section-title">Claim OVRG from Stakes</h3>
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
					<div className="o-half i-ibco-input">
						<CurrencyTextField
						variant="outlined"
						currencySymbol="OVRG"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(event, value)=> {
							if(value>0){handleTransactionValueChange(value)};
						}}
							/>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"Claim OVRG from Stakes"}
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
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Stakes
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Claimed Stakes
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
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
					<div className="o-half i-ibco-input">
						<CurrencyTextField
						variant="outlined"
						currencySymbol="OVRG15"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(event, value)=> {
							if(value>0){handleTransactionValueChange(value)};
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
						<div className="o-half i-ibco-input">
							<CurrencyTextField
							variant="outlined"
							currencySymbol="OVRG15"
							minimumValue={"0"}
							decimalCharacter="."
							digitGroupSeparator=","
							onChange={(event, value)=> {
								if(value>0){handleTransactionValueChange(value)};
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
						<h3 className="c-section-title">Claim OVRG15 from Stakes</h3>
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
					<div className="o-half i-ibco-input">
						<CurrencyTextField
						variant="outlined"
						currencySymbol="OVRG15"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(event, value)=> {
							if(value>0){handleTransactionValueChange(value)};
						}}
							/>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"Claim OVRG15 from Stakes"}
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
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Total Stakes
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								Claimed Stakes
							</div>
							<div className="o-value">
								<ValueCounter value={10000} currency="ovr"></ValueCounter>
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
					<div className="o-half i-ibco-input">
						<CurrencyTextField
						variant="outlined"
						currencySymbol="OVRG30"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(event, value)=> {
							if(value>0){handleTransactionValueChange(value)};
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
						<div className="o-half i-ibco-input">
							<CurrencyTextField
							variant="outlined"
							currencySymbol="OVRG30"
							minimumValue={"0"}
							decimalCharacter="."
							digitGroupSeparator=","
							onChange={(event, value)=> {
								if(value>0){handleTransactionValueChange(value)};
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
						<h3 className="c-section-title">Claim OVRG30 from Stakes</h3>
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
					<div className="o-half i-ibco-input">
						<CurrencyTextField
						variant="outlined"
						currencySymbol="OVRG30"
						minimumValue={"0"}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(event, value)=> {
							if(value>0){handleTransactionValueChange(value)};
						}}
							/>
					</div>
					<div className="o-half">
						<HexButton
							url="#"
							text={"Claim OVRG30 from Stakes"}
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
										<h3 className="p-card-title">Titolo</h3>
									</div>
									<div className="o-row">
										Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. 
										<br></br><br></br>It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
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
