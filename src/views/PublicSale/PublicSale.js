import React, {useContext} from 'react';
import { useTranslation } from 'react-i18next'
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import HexButton from '../../components/HexButton/HexButton';
import TermsAndConditionsOverlay from '../../components/TermsAndConditionsOverlay/TermsAndConditionsOverlay'
import { Web3Context } from '../../context/Web3Context';
import { UserContext } from '../../context/UserContext';
import { ethers, BigNumber,utils } from 'ethers';
import bn from "bignumber.js";

import config from '../../lib/config';
import { useHistory,Link } from 'react-router-dom';

import CurrencyTextField from '@unicef/material-ui-currency-textfield'
import TextField from '@material-ui/core/TextField';
import {Chart} from 'chart.js'
const mantissa = new bn(1e18);

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
	const [ibcoIsReady, setIbcoIsReady] = React.useState(false);
	const [ibcoOVRDAIPrice, setIbcoOVRDAIPrice] = React.useState(0.1);
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

	React.useEffect(() => {
		renderChart();
	}, []);

	React.useEffect(() => {
		if(web3Context.state){
			if(web3Context.state.ibcoSetupComplete){
				if(web3Context.state.ibcoSetupComplete === true){
					console.log('web3Context.state', web3Context.state)
					// web3Context.actions.ibcoPoll()
					setIbcoIsReady(true)
				}
			}
		}
	}, [web3Context]);

	// 

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
				setTransactionValueDescription(`Sell ${transactionValue} OVR for ${(transactionValue * ibcoOVRDAIPrice).toFixed(2)} DAI`)
			} else {
				setTransactionValueDescription(`Buy ${(transactionValue / ibcoOVRDAIPrice).toFixed(2)} OVR for ${transactionValue} DAI`)
			}
	};

	const handleApprove = async (val) => {
			let approve = await web3Context.state.ibcoDAISigner.approve(
					config.api.curveAddress,
					new bn(val).times(mantissa).toFixed(0)
			);
			if (approve.status === 1) {
					alert(val, " DAI Approved");
			}
	};

	const handleBuyOvr = (valueToBuy) => {
		// Check allowance
		if(web3Context.state.ibcoDAIAllowance < valueToBuy ){

		}
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
	}

	function renderChart(){
		
		var ctx = document.getElementById("myChart");
		var initialSupplyToken = 81688155;
		var connectorBalance = 114363.42;
		var CW = 0.02;

		var data = ["10000","20000","30000","40000","50000","60000","70000","80000","90000","100000","200000","300000","400000","500000","600000","700000","800000","900000","1000000","1100000","1200000","1300000","1400000","1500000","1600000","1700000","1800000","1900000","2000000","2100000","2200000","2300000","2400000","2500000","2600000","2700000","2800000","2900000","3000000","3100000","3200000","3300000","3400000","3500000","3600000","3700000","3800000","3900000","4000000","4100000","4200000","4300000","4400000","4500000","4600000","4700000","4800000","4900000","5000000","5100000","5200000","5300000","5400000","5500000","5600000","5700000","5800000","5900000","6000000","6100000","6200000","6300000","6400000","6500000","6600000","6700000","6800000","6900000","7000000","7100000","7200000","7300000","7400000","7500000","7600000","7700000","7800000","7900000","8000000","8100000","8200000","8300000","8400000","8500000","8600000","8700000","8800000","8900000","9000000","9100000","9200000","9300000","9400000","9500000","9600000","9700000","9800000","9900000","10000000"]

		function getX(x) { 
			return initialSupplyToken*((Math.pow(((1+(x/connectorBalance))), CW))-1) 
		}
		var dataX = data.map(x => getX(x));

		function getY(x, i) { 
			return (x/dataX[i])
		}
		var dataY = data.map((x,i) => getY(x,i));

		var dataXY = [];
		for (var i = 0; i < dataX.length; i++) {
			let dot = {x: dataX[i],y: dataY[i]}
			dataXY.push(dot)
		}

		var gradientStroke = ctx.getContext("2d").createLinearGradient(500, 0, 100, 0);
		gradientStroke.addColorStop(0, '#f9b426');

		gradientStroke.addColorStop(1, '#ec663c');


		var scatterChart = new Chart(ctx, {
					type: 'line',
					data: {
									datasets: [{
													label: 'Bancor Formula',
													data: dataXY,
													backgroundColor: gradientStroke,
													borderColor: '#5d509c',
													borderWidth:3,
													fill: true,
													borderDash: [0,0],
								pointRadius: 0,
								pointHoverRadius: 0,
									}]
					},
					options: {
									legend: {
											display: false
									},
									scales: {
													xAxes: [{
															type: 'linear',
															position: 'bottom',
															scaleLabel: {
																	display: true,
																	labelString: 'Supply'
															}
													}],
													yAxes: [{
															type: 'linear',
															position: 'bottom',
															scaleLabel: {
																	display: true,
																	labelString: 'Price'
															}
													}]
									}
					}
		});
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
				minimumValue={"0"}
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
						minimumValue={"0"}
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
							onClick={() => handleSellOvr(transactionValue)}
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
						<div className="o-card --chart-js">
							<div className="o-row">
								<div className="o-third">
									<div className="o-label">
										Buy Price
									</div>
									<div className="o-value">
										<ValueCounter value={ibcoOVRDAIPrice} currency="dai"></ValueCounter>
									</div>
								</div>
								<div className="o-third">
									<div className="o-label">
										Reserve
									</div>
									<div className="o-value">
										<ValueCounter value={ibcoIsReady ? <>
											{parseFloat(ethers.utils.formatEther(web3Context.state.ibcoDAIReserve).toString()).toFixed(2)}
										</> : '0.0'} currency="dai"></ValueCounter>
									</div>
								</div>
								<div className="o-third">
									<div className="o-label">
										Curve Issuance
									</div>
									<div className="o-value">
										<ValueCounter value={ibcoIsReady ? <>
											{parseFloat(ethers.utils.formatEther(web3Context.state.ibcoOVRSupply).toString()).toFixed(2)}
										</> : '0.0'}></ValueCounter>
									</div>
								</div>
							</div>
							<div className="o-row">
								<div className="chart-js">
									<canvas id="myChart"></canvas>
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
								<ValueCounter value={ibcoIsReady ? <>
									{ethers.utils.formatEther(web3Context.state.ibcoDAIBalance)}
								</> : '0.0'} currency="dai"></ValueCounter>
								<ValueCounter value={ibcoIsReady ? <>
									{ethers.utils.formatEther(web3Context.state.ibcoRewardBalance)}
								</> : '0.0'}></ValueCounter>
							</div>
							<br></br>
							<div className="o-row">Allowance {ibcoIsReady ? <>
								{ethers.utils.formatEther(web3Context.state.ibcoDAIAllowance)}
							</> : '0.0'}</div>
							<div className="o-line"></div>
							<div className="o-row o-info-row">
								<div className="o-half"><h3 className="o-info-title">Price</h3></div>
								<div className="o-half --values-holder">
									<ValueCounter value={"1"} currency="ovr"></ValueCounter><span>=</span><ValueCounter value={ibcoOVRDAIPrice} currency="dai"></ValueCounter>
								</div>
							</div>
							<div className="o-row o-info-row">
								<div className="o-half"><h3 className="o-info-title">Receive Amount</h3></div>
								<div className="o-half">

									{tab === "buy" ? <ValueCounter value={(transactionValue / ibcoOVRDAIPrice).toFixed(2)} currency="ovr"></ValueCounter>
										: <ValueCounter value={(transactionValue * ibcoOVRDAIPrice).toFixed(2)} currency="dai"></ValueCounter>}
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
