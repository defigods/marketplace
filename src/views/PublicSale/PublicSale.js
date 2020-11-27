import React, {useContext} from 'react';
import { useTranslation } from 'react-i18next'
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import HexButton from '../../components/HexButton/HexButton';
import TermsAndConditionsOverlay from '../../components/TermsAndConditionsOverlay/TermsAndConditionsOverlay'
import { Web3Context } from '../../context/Web3Context';
import { UserContext } from '../../context/UserContext';

import config from '../../lib/config';
import { useHistory,Link } from 'react-router-dom';

import CurrencyTextField from '@unicef/material-ui-currency-textfield'
import TextField from '@material-ui/core/TextField';


function PublicSale() {
	const { t, i18n } = useTranslation();
	const [tab, setTab] = React.useState('buy');
	const [transactionValue, setTransactionValue] = React.useState(0.00);
	const [transactionValueDescription, setTransactionValueDescription] = React.useState("Buy 0 OVR for 0 DAI");
	const [transactionValueValid, setTransactionValueValid] = React.useState(false);

	let history = useHistory();
	const web3Context = useContext(Web3Context);
	const userContext = useContext(UserContext);

	const [ibcoPendingTransactions, setIbcoPendingTransactions] = React.useState([]);
	const [ibcoMyTransactions, setIbcoMyTransactions] = React.useState([]);
	const [ibcoCurveHistory, setIbcoCurveHistory] = React.useState([]);
	const [ibcoAreTermsAccepted, setIbcoAreTermsAccepted] = React.useState(false);
	const [ibcoIsKYCPassed, setIbcoIsKYCPassed] = React.useState(false);
	const [ibcoOVRPrice, setIbcoOVRPrice] = React.useState(0.06);
	const [ibcoSlippage, setIbcoSlippage] = React.useState(0.0);
	const [showTermsAndConditionsOverlay, setShowTermsAndConditionsOverlay] = React.useState(false);

	// Check if anything changed from web3context
	React.useEffect(() => {
		setIbcoPendingTransactions(web3Context.state.ibcoPendingTransactions)
		setIbcoMyTransactions(web3Context.state.ibcoMyTransactions)
		setIbcoCurveHistory(web3Context.state.ibcoCurveHistory) 
	}, [web3Context.state.ibcoPendingTransactions,web3Context.state.ibcoMyTransactions,web3Context.state.ibcoCurveHistory]);

	// Check if terms condition changed from userstate and kyc passed
	React.useEffect(() => {
		console.log('userContext state has changed',userContext.state)
		if(userContext.state !== undefined && userContext.state.hasLoaded == true){
			// Terms and conditions
			if(Boolean(userContext.state.user.ibcoAcceptedTerms) == true){
				setIbcoAreTermsAccepted(true)
			} else {
				setIbcoAreTermsAccepted(false)
			}
			// Kyc
			if(Boolean(userContext.state.user.kycReviewAnswer) == true){
				setIbcoIsKYCPassed(true)
			}
		} else {
			setIbcoAreTermsAccepted(false)
		}
	}, [userContext.state, userContext.state.hasLoaded]);


	const handleTabChange = (newValue) => {
			setTab(newValue);
			setTransactionValueValid(false);
			if(newValue === 'sell'){
				setTransactionValue(0.0)
				setTransactionValueDescription("Sell 0 OVR for 0 DAI")
			} else {
				setTransactionValue(0.0)
				setTransactionValueDescription("Buy 0 OVR for 0 DAI")
			}
			
	};

	const handleTransactionValueChange = (transactionValue) => {
			setTransactionValue(transactionValue);
			if( transactionValue > 0){
				setTransactionValueValid(true)
			} else {
				// To do allowance limit
				setTransactionValueValid(false)
			}
			if(tab === 'sell'){
				setTransactionValueDescription(`Sell ${transactionValue} OVR for ${(transactionValue * ibcoOVRPrice).toFixed(2)} DAI`)
			} else {
				setTransactionValueDescription(`Buy ${(transactionValue / ibcoOVRPrice).toFixed(2)} OVR for ${transactionValue} DAI`)
			}
	};

	const handleBuyOvr = () => {

	}

	const handleSellOvr = () => {

	}

	function renderIbcoPendingTransactions() {
		if (ibcoPendingTransactions === undefined || ibcoPendingTransactions.length == 0) {
			return (
				<div className="o-container">
					<div className="Title__container">
						<h3 className="o-small-title"></h3>
					</div>
					<div className="c-dialog --centered">
						<div className="c-dialog-main-title">
							You have no open transactions
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="Table__container">
					<table className="Table">
						<thead>
							<tr>
								<th>TX ID</th>
								<th>Type</th>
								<th>Price (DAI)</th>
								<th>Amount (OVR)</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{ibcoPendingTransactions.map((trans) => (
								<tr key={trans.txId} className="Table__line">
									<td className="max --trans">
										<a href={`${config.apis.etherscan}tx/${trans.txId}`} target="_blank">
											{trans.txId.slice(0,8)}...{trans.txId.slice(-8)}
										</a>
									</td>
									<td className="min">{trans.type}</td>
									<td className="min"><ValueCounter value={trans.price} currency="dai"></ValueCounter></td>
									<td className="min"><ValueCounter value={trans.amount}></ValueCounter></td>
									<td className="min">{trans.status}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
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
							You have no transactions
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="Table__container">
					<table className="Table">
						<thead>
							<tr>
								<th>TX ID</th>
								<th>Type</th>
								<th>Price (DAI)</th>
								<th>Amount (OVR)</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{ibcoMyTransactions.map((trans) => (
								<tr key={trans.txId} className="Table__line">
									<td className="max --trans">
										<a href={`${config.apis.etherscan}tx/${trans.txId}`} target="_blank">
											{trans.txId.slice(0,8)}...{trans.txId.slice(-8)}
										</a>
									</td>
									<td className="min">{trans.type}</td>
									<td className="min"><ValueCounter value={trans.price} currency="dai"></ValueCounter></td>
									<td className="min"><ValueCounter value={trans.amount}></ValueCounter></td>
									<td className="min">{trans.status}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}
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
							There is no transaction to show
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="Table__container">
					<table className="Table">
						<thead>
							<tr>
								<th>TX ID</th>
								<th>Type</th>
								<th>Price (DAI)</th>
								<th>Amount (OVR)</th>
								<th>Time</th>
							</tr>
						</thead>
						<tbody>
							{ibcoCurveHistory.map((trans) => (
								<tr key={trans.txId} className="Table__line">
									<td className="max --trans">
										<a href={`${config.apis.etherscan}tx/${trans.txId}`} target="_blank">
											{trans.txId.slice(0,8)}...{trans.txId.slice(-8)}
										</a>
									</td>
									<td className="min">{trans.type}</td>
									<td className="min"><ValueCounter value={trans.price} currency="dai"></ValueCounter></td>
									<td className="min"><ValueCounter value={trans.amount}></ValueCounter></td>
									<td className="min">{trans.time}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}
	}

	function toggleTermsAndConditionsOverlay(a){
		setShowTermsAndConditionsOverlay(a);
		console.log('showTermsAndConditions')
	}
	
	function renderActionButtonSection() {
		if(ibcoIsKYCPassed !== true){
			return (<div className="--centered-button-holder">
				<HexButton
					url="#"
					text={'Verify Identity to participate'}
					className={`--orange --large --kyc-button`}
					// ${bidValid ? '' : '--disabled'}
					onClick={() => {history.push('/profile')}}
				></HexButton>
			</div>)
		}
		if(ibcoAreTermsAccepted !== true){ 
			return (<div className="--centered-button-holder">
				<HexButton
					url="#"
					text={'Accept Terms and Conditions'}
					className={`--orange --large --kyc-button`}
					// ${bidValid ? '' : '--disabled'}
					onClick={() => toggleTermsAndConditionsOverlay(true)}
				></HexButton>
			</div>)
		}

		// If is Buy if is Sell
		if( tab === "buy"){
		return (
		<div className="i-ibco-input">
			<div>
				<CurrencyTextField
				variant="outlined"
				value={transactionValue}
				currencySymbol="DAI"
				minimumValue={0.0}
				decimalCharacter="."
				digitGroupSeparator=","
				onChange={(event, value)=> {
					handleTransactionValueChange(value);
				}}
					/>
				<div className="--centered-button-holder">
					<HexButton
						url="#"
						text={transactionValueDescription}
						className={`--orange --large --kyc-button ${transactionValueValid == false ? '--disabled' : ''}`}
						// ${bidValid ? '' : '--disabled'}
						onClick={() => handleBuyOvr(transactionValue)}
					></HexButton>
				</div>
			</div>
		</div>)
		} else {
			return (
			<div className="i-ibco-input">
				<div>
					<CurrencyTextField
						variant="outlined"
						value={transactionValue}
						currencySymbol="OVR"
						minimumValue={0.0}
						decimalCharacter="."
						digitGroupSeparator=","
						onChange={(event, value)=> {
							handleTransactionValueChange(value);
						}}
						/>
					<div className="--centered-button-holder">
						<HexButton
							url="#"
							text={transactionValueDescription}
							className={`--purple --large --kyc-button ${transactionValueValid == false ? '--disabled' : ''}`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => handleBuyOvr(transactionValue)}
						></HexButton>
					</div>
				</div>
			</div>)
		}
	}

	return (
		<div className="PublicSale">
			<TermsAndConditionsOverlay disableTermsAndConditionsOverlay={()=>toggleTermsAndConditionsOverlay(false)} showOverlay={showTermsAndConditionsOverlay}/>
			<div className="o-container">
				<div className="o-section">
					<div className="s-f-curve">
						<div className="o-card">
							<div className="o-row">
								<div className="o-third">
									<div className="o-label">
										Buy Price
									</div>
									<div className="o-value">
										<ValueCounter value={0.066} currency="dai"></ValueCounter>
									</div>
								</div>
								<div className="o-third">
									<div className="o-label">
										Reserve
									</div>
									<div className="o-value">
										<ValueCounter value={420420420} currency="dai"></ValueCounter>
									</div>
								</div>
								<div className="o-third">
									<div className="o-label">
										Curve Issuance
									</div>
									<div className="o-value">
										<ValueCounter value={1000000}></ValueCounter>
									</div>
								</div>
							</div>
							<div className="o-row">
								<div className="chart-js">
									TODO: Chart
								</div> 
							</div>
						</div>
					</div>
					<div className="s-f-panel">
						<div className="o-card">
							<div className="o-row">
								<div className="c-transaction-selector_cont">
									<div
										className={`c-transaction-selector ${tab == 'buy' ? '--selected' : ''}`}
										onClick={() => handleTabChange('buy')}
									>
										Buy
									</div>
									<div
										className={`c-transaction-selector --second ${tab == 'sell' ? '--selected' : ''}`}
										onClick={() => {handleTabChange('sell')}}
									>
										Sell
									</div>
								</div>
							</div>
							<div className="o-row o-row__your_wallet">
								<h3 className="p-section-title">Your Wallet</h3>
								<ValueCounter value={"5000.00"} currency="dai"></ValueCounter>
								<ValueCounter value={"0.00"}></ValueCounter>
							</div>
							<br></br>
							<div className="o-row">Allowance XXXX</div>
							<div className="o-line"></div>
							<div className="o-row o-info-row">
								<div className="o-half"><h3 className="o-info-title">Price</h3></div>
								<div className="o-half --values-holder">
									<ValueCounter value={ibcoOVRPrice} currency="ovr"></ValueCounter><span>=</span><ValueCounter value={"1"} currency="dai"></ValueCounter>
								</div>
							</div>
							<div className="o-row o-info-row">
								<div className="o-half"><h3 className="o-info-title">Receive Amount</h3></div>
								<div className="o-half">

									{tab === "buy" ? <ValueCounter value={(transactionValue / ibcoOVRPrice).toFixed(2)} currency="ovr"></ValueCounter>
										: <ValueCounter value={(transactionValue * ibcoOVRPrice).toFixed(2)} currency="dai"></ValueCounter>}
								</div>
							</div>
							<div className="o-row o-info-row">
								<div className="o-half"><h3 className="o-info-title">Slippage</h3></div>
								<div className="o-half">{ibcoSlippage}%</div>
							</div>
							<div className="o-line"></div>
							<div className="o-row o-field-row">
								{renderActionButtonSection()}
							</div>
						</div>
					</div>	
				</div>
				<div className="o-section">
					<div className="o-card">
						<div className="o-row">
							<h3 className="o-card-title">Pending Transactions</h3>
						</div>
						<div className="o-line --venti"></div>
						<div className="o-row">
							{renderIbcoPendingTransactions()}
						</div>
					</div>
				</div>
				<div className="o-section">
					<div className="o-card">
						<div className="o-row">
							<h3 className="o-card-title">My Transactions</h3>
						</div>
						<div className="o-line --venti"></div>
						<div className="o-row">
							{renderIbcoMyTransactions()}
						</div>
					</div>
				</div>
				<div className="o-section">
					<div className="o-card">
						<div className="o-row">
							<h3 className="o-card-title">Curve Historys</h3>
						</div>
						<div className="o-line --venti"></div>
						<div className="o-row">
							{renderIbcoCurveHistory()}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default PublicSale;
