import React, {useContext} from 'react';
import { useTranslation } from 'react-i18next'
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import HexButton from '../../components/HexButton/HexButton';
import TermsAndConditionsOverlay from '../../components/TermsAndConditionsOverlay/TermsAndConditionsOverlay'
import { Web3Context } from '../../context/Web3Context';
import { UserContext } from '../../context/UserContext';
import { warningNotification } from '../../lib/notifications';

import { ethers, BigNumber,utils } from 'ethers';
import bn from "bignumber.js";

import config from '../../lib/config';
import { useHistory,Link } from 'react-router-dom';

import CurrencyTextField from '@unicef/material-ui-currency-textfield'
import TextField from '@material-ui/core/TextField';
import {Chart} from 'chart.js'
const mantissa = new bn(1e18);
let ctx;
let scatterChart;
let chartData;
let gradientStroke;

function PublicSale() {
	const { t, i18n } = useTranslation();
	const [tab, setTab] = React.useState('buy');
	const [transactionValue, setTransactionValue] = React.useState(0.00);
	const [transactionValueDescription, setTransactionValueDescription] = React.useState(t('IBCO.exchange.buy', { OVRNumber: '0', DAINumber: '0' }));
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
	const [hasPointRendered, setHasPointRendered] = React.useState(false);
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
					prepareIbcoCuverHistoryAndMyTrans();
					prepareIbcoMyOpenTransactions();
					renderPointsOnChart();
				}
			}
		}
	}, [web3Context]);

	React.useEffect(() => {
		prepareIbcoCuverHistoryAndMyTrans();
		prepareIbcoMyOpenTransactions();
	}, [web3Context.state.ibcoClaims, web3Context.state.ibcoOpenBuyOrders, web3Context.state.ibcoOpenSellOrders]);
	// Interface helpers

	const handleTabChange = (newValue) => {
			setTab(newValue);
			setTransactionValueValid(false);
			if(newValue === 'sell'){
				setTransactionValue(0.0)
				setTransactionValueDescription(t('IBCO.exchange.sell', { OVRNumber: 0, DAINumber: 0 }))
			} else {
				setTransactionValue(0.0)
				setTransactionValueDescription(t('IBCO.exchange.buy', { OVRNumber: 0, DAINumber: 0 }))
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
				setTransactionValueDescription(t('IBCO.exchange.sell', { OVRNumber: transactionValue, DAINumber: (transactionValue * ibcoOVRDAIPrice).toFixed(2) }))
			} else {
				setTransactionValueDescription(t('IBCO.exchange.buy', { OVRNumber: transactionValue, DAINumber: (transactionValue * ibcoOVRDAIPrice).toFixed(2) }))
			}
	};


	// Buy and Sell handle functions
	const handleApprove = async (val) => {
			let approve = await web3Context.state.ibcoDAISigner.approve(
					config.apis.curveAddress,
					new bn(val).times(mantissa).toFixed(0)
			);
	};

	const handleBuyOvr = async (valueToBuy) => {
		// Check approval
		console.log('AAA')
		if(web3Context.state.ibcoDAIAllowance < valueToBuy ){
			await handleApprove(1000000000000)
		}	
		console.log('BBB')
		// Check your balance 
		if(parseFloat(ethers.utils.formatEther(web3Context.state.ibcoDAIBalance).toString()).toFixed(2) < valueToBuy){
			console.log('CCC')
			warningNotification(t('Warning.no.token.title'), t('Warning.no.tokens.desc', { message: 'DAI' }));
		} else {
			// Open MetaMask
			console.log('DDD')
			let open = await web3Context.state.ibcoController.openBuyOrder(
					config.apis.DAI,
					new bn(valueToBuy).times(mantissa).toFixed(0)
			);
		}	
	}

	const handleSellOvr = async (valueToSell) => {
		// Check your balance 
		if(parseFloat(ethers.utils.formatEther(web3Context.state.ibcoRewardBalance).toString()).toFixed(2) < valueToSell){
			warningNotification(t('Warning.no.token.title'), t('Warning.no.ovrtokens.desc', { message: 'OVR' }));
		} else {
			// Open MetaMask
			let sell = await web3Context.state.ibcoController.openSellOrder(
					config.apis.DAI,
					new bn(valueToSell).times(mantissa).toFixed(0)
			);
		}	
	}

	// Claim Sell and Buy functions

	// handles user clicking "Claim Buy Order" button
	const handleClaimBuy = async (e) => {
			// e.preventDefault();
			let batch = e.target.dataset.b;
			let batchId = await web3Context.state.ibcoCurveViewer.getCurrentBatchId();
			if (batchId > batch) {
					let claim = await web3Context.state.ibcoController.claimBuyOrder(
							web3Context.state.address,
							batch,
							config.apis.DAI
					);
					console.log("CLAIM BUY", claim);

					let reward = await web3Context.state.ibcoRewardViewer.balanceOf(
							web3Context.state.address
					);
					web3Context.actions.setRewardBalance(reward);
			} else {
					alert("Please wait one block for batch to mature");
			}
	};

	// handles user clicking "Claim Sell Order" button
	const handleClaimSell = async (e) => {
			let batch = e.target.dataset.b;
			let batchId = await web3Context.state.ibcoCurveViewer.getCurrentBatchId();
			if (batchId > batch) {
					let claim = await web3Context.state.ibcoController.claimSellOrder(
							web3Context.state.address,
							batch,
							config.apis.DAI
					);
					console.log("CLAIM SELL", claim);

					let reward = await web3Context.state.ibcoRewardViewer.balanceOf(
							web3Context.state.address
					);
					web3Context.actions.setRewardBalance(reward);
			} else {
					alert("Please wait one block for batch to mature");
			}
	};


	// Render Helpers for transactions

	function prepareIbcoMyOpenTransactions(){
		let openPending = [];
		for (const claim of web3Context.state.ibcoOpenBuyOrders) {
			let nClaim = {
				type: 'Buy',
				batchId: claim.batchId,
				amount: 0,
				fee: parseFloat(ethers.utils.formatEther(claim.fee).toString()),
				value: parseFloat(ethers.utils.formatEther(claim.value).toString()),
				
			}
			openPending.push(nClaim);
		}
		for (const claim of web3Context.state.ibcoOpenSellOrders) {
			let nClaim = {
				type: 'Sell',
				batchId: claim.batchId,
				amount: parseFloat(ethers.utils.formatEther(claim.amount).toString()),
				fee: 0,
				value: 0
				
			}
			openPending.push(nClaim);
		}
		setIbcoPendingTransactions(openPending)
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
							{t('IBCO.no.transactions')}
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
								<th>{t("IBCO.transaction.transactionID")}</th>
								<th>{t('IBCO.transaction.type')}</th>
								<th>{t('IBCO.transaction.publicaddress')}</th>
								{/* <th>Fee (DAI)</th> */}
								<th>{t('IBCO.transaction.amountOVR')}</th>
								<th>{t("IBCO.transaction.status")}</th>
							</tr>
						</thead>
						<tbody>
							{ibcoPendingTransactions.map((trans) => (
								<tr className="Table__line" key={trans.batchId+trans.public_address+trans.price}>
									<td className="max --trans">
										{/* <a href={`${config.apis.etherscan}tx/${ethers.utils.formatEther(trans.batchId).toString()}`} target="_blank">
											{ethers.utils.formatEther().toString().slice(0,8)}...{ethers.utils.formatEther(trans.batchId).toString().slice(-8)}
										</a> */}
										{trans.batchId._hex}
									</td>
									<td className="min">{trans.type}</td>
									<td className="min">
										{trans.value == 0 ? <></> : <ValueCounter value={trans.value} currency="dai"></ValueCounter>}
									</td>
									{/* <td className="min">
										{trans.fee == 0 ? <></> : <ValueCounter value={trans.fee} currency="dai"></ValueCounter>}
									</td> */}
									<td className="min">
										{trans.amount == 0 ? <></> : <ValueCounter value={trans.amount} currency="ovr"></ValueCounter>}
									</td>
									<td className="min">
										{trans.type === "Sell" ? <div
												className="HexButton --orange"
												data-b={trans.batchId}
												onClick={handleClaimSell}
										>{t("IBCO.claim.sell")}</div>: <div
												className="HexButton --orange"
												data-b={trans.batchId}
												onClick={handleClaimBuy}
										>{t("IBCO.claim.buy")}</div>}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}
	}

	function prepareIbcoCuverHistoryAndMyTrans(){
		let hClaim = [];
		let myClaim = [];
		for (const claim of web3Context.state.ibcoClaims) {
			console.log('claim.type',claim.type)
				if (claim.type === "ClaimBuyOrder") {
					let nClaim = {
						type: t("IBCO.buy"),
						batchId: claim.batchId._hex,
						public_address: claim.buyer,
						amount: parseFloat(ethers.utils.formatEther(claim.amount).toString()).toFixed(2),
						fee: 0,
						value: 0
					}
					hClaim.push(nClaim);
					if(claim.buyer === web3Context.state.address){ myClaim.push(nClaim) }
				} else {
					let nClaim = {
						type:  t("IBCO.sell"),
						batchId: claim.batchId._hex,
						public_address: claim.seller,
						amount: 0,
						fee: parseFloat(ethers.utils.formatEther(claim.fee).toString()).toFixed(2),
						value: parseFloat(ethers.utils.formatEther(claim.value).toString()).toFixed(2)
					}
					hClaim.push(nClaim);
					console.log('claim.seller',claim.seller)
					console.log('web3Context.state.address',web3Context.state.address)
					if(claim.seller === web3Context.state.address){ myClaim.push(nClaim) }
				}
		}
		setIbcoCurveHistory(hClaim)
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
							{t('IBCO.no.transactions')}
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
								<tr className="Table__line" key={trans.batchId+trans.public_address+trans.price}>
									<td className="max --trans">
										{/* <a href={`${config.apis.etherscan}tx/${ethers.utils.formatEther(trans.batchId).toString()}`} target="_blank">
											{ethers.utils.formatEther().toString().slice(0,8)}...{ethers.utils.formatEther(trans.batchId).toString().slice(-8)}
										</a> */}
										{trans.batchId}
									</td>
									<td className="min">{trans.type}</td>
									<td className="min --addr">{trans.public_address}</td>
									<td className="min">
										{trans.value == 0 ? <></> : <ValueCounter value={trans.value} currency="dai"></ValueCounter>}
									</td>
									{/* <td className="min">
										{trans.fee == 0 ? <></> : <ValueCounter value={trans.fee} currency="dai"></ValueCounter>}
									</td> */}
									<td className="min">
										{trans.amount == 0 ? <></> : <ValueCounter value={trans.amount} currency="ovr"></ValueCounter>}
									</td>
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
							{t('IBCO.no.transactions')}
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
								<th>{t('IBCO.transaction.batchID')}</th>
								<th>{t('IBCO.transaction.type')}</th>
								<th>{t('IBCO.transaction.publicaddress')}</th>
								{/* <th>Fee (DAI)</th> */}
								<th>{t('IBCO.transaction.amountOVR')}</th>
							</tr>
						</thead>
						<tbody>
							{ibcoCurveHistory.map((trans) => (
								<tr className="Table__line" key={trans.batchId+trans.public_address+trans.price}>
									<td className="max --trans">
										{/* <a href={`${config.apis.etherscan}tx/${ethers.utils.formatEther(trans.batchId).toString()}`} target="_blank">
											{ethers.utils.formatEther().toString().slice(0,8)}...{ethers.utils.formatEther(trans.batchId).toString().slice(-8)}
										</a> */}
										{trans.batchId}
									</td>
									<td className="min">{trans.type}</td>
									<td className="min">
										{trans.value == 0 ? <></> : <ValueCounter value={trans.value} currency="dai"></ValueCounter>}
									</td>
									{/* <td className="min">
										{trans.fee == 0 ? <></> : <ValueCounter value={trans.fee} currency="dai"></ValueCounter>}
									</td> */}
									<td className="min">
										{trans.amount == 0 ? <></> : <ValueCounter value={trans.amount} currency="ovr"></ValueCounter>}
									</td>
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
		
		ctx = document.getElementById("myChart");
		var initialSupplyToken = 81688155;
		var connectorBalance = 114363.42;
		var CW = 0.02;

		var data = ["10000","20000","30000","40000","50000","60000","70000","80000","90000","100000","200000","300000","400000","500000","600000","700000","800000","900000","1000000","1100000","1200000","1300000","1400000","1500000","1600000","1700000","1800000","1900000","2000000","2100000","2200000","2300000","2400000","2500000","2600000","2700000","2800000","2900000","3000000","3100000","3200000","3300000","3400000","3500000","3600000","3700000","3800000","3900000","4000000","4100000","4200000","4300000","4400000","4500000","4600000","4700000","4800000","4900000","5000000","5100000","5200000","5300000","5400000","5500000","5600000","5700000","5800000","5900000","6000000","6100000","6200000","6300000","6400000","6500000","6600000","6700000","6800000","6900000","7000000","7100000","7200000","7300000","7400000","7500000","7600000","7700000","7800000","7900000","8000000","8100000","8200000","8300000","8400000","8500000","8600000","8700000","8800000","8900000","9000000","9100000","9200000","9300000","9400000","9500000","9600000","9700000","9800000","9900000","10000000"]
		var dataLabels = ["10.000","20.000","30.000","40.000","50.000","60.000","70.000","80.000","90.000","100.000","200.000","300.000","400.000","500.000","600.000","700.000","800.000","900.000","1.000.000","1.100.000","1.200.000","1.300.000","1.400.000","1.500.000","1.600.000","1.700.000","1.800.000","1.900.000","2.000.000","2.100.000","2.200.000","2.300.000","2.400.000","2.500.000","2.600.000","2.700.000","2.800.000","2.900.000","3.000.000","3.100.000","3.200.000","3.300.000","3.400.000","3.500.000","3.600.000","3.700.000","3.800.000","3.900.000","4.000.000","4.100.000","4.200.000","4.300.000","4.400.000","4.500.000","4.600.000","4.700.000","4.800.000","4.900.000","5.000.000","5.100.000","5.200.000","5.300.000","5.400.000","5.500.000","5.600.000","5.700.000","5.800.000","5.900.000","6.000.000","6.100.000","6.200.000","6.300.000","6.400.000","6.500.000","6.600.000","6.700.000","6.800.000","6.900.000","7.000.000","7.100.000","7.200.000","7.300.000","7.400.000","7.500.000","7.600.000","7.700.000","7.800.000","7.900.000","8.000.000","8.100.000","8.200.000","8.300.000","8.400.000","8.500.000","8.600.000","8.700.000","8.800.000","8.900.000","9.000.000","9.100.000","9.200.000","9.300.000","9.400.000","9.500.000","9.600.000","9.700.000","9.800.000","9.900.000","10.000.000"]

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

		gradientStroke = ctx.getContext("2d").createLinearGradient(500, 0, 100, 0);
		gradientStroke.addColorStop(0, '#f9b426');
		gradientStroke.addColorStop(1, '#ec663c');

		chartData = {
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
		}
		
		scatterChart = new Chart(ctx, {
			type: 'line',
			data: chartData,
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
						},
						ticks: {
										// Include a dollar sign in the ticks
										callback: function(value, index, values) {
											return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
										}
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

	function renderPointsOnChart(){
		if(hasPointRendered == false){
			var newDataset = {
				data: [{x: 3000000, y: 0.19}],
				backgroundColor: gradientStroke,
				label: "Starting price",
				borderColor: '#5d509c',
				pointBackgroundColor:'#5d509c',
				borderWidth:3,
				intersect: false,
				fill: true,
				borderDash: [0,0],
				pointRadius: 5,
				pointHoverRadius: 5,
			}
			chartData.datasets.push(newDataset);

			var newDataset = {
				data: [{x: 6000000, y: 0.64}],
				backgroundColor: gradientStroke,
				label: "Starting price",
				borderColor: '#5d509c',
				pointBackgroundColor:'#5d509c',
				borderWidth:3,
				intersect: false,
				fill: true,
				borderDash: [0,0],
				pointRadius: 5,
				pointHoverRadius: 5,
			}
			chartData.datasets.push(newDataset);

			scatterChart.update();
			setHasPointRendered(true)
		}
	}
	
	function renderActionButtonSection() {
		if(ibcoIsKYCPassed !== true){
			return (<div className="--centered-button-holder">
				<HexButton
					url="#"
					text={t('IBCO.verify.toparticipate')}
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
					text={t('IBCO.accept.toparticipate')}
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
					if(value>0){handleTransactionValueChange(value)};
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
							if(value>0){handleTransactionValueChange(value)};
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
										{t('IBCO.buyprice')}
									</div>
									<div className="o-value">
										<ValueCounter value={ibcoOVRDAIPrice} currency="dai"></ValueCounter>
									</div>
								</div>
								<div className="o-third">
									<div className="o-label">
										{t('IBCO.reserve')}
									</div>
									<div className="o-value">
										<ValueCounter value={ibcoIsReady ? <>
											{parseFloat(ethers.utils.formatEther(web3Context.state.ibcoDAIReserve).toString()).toFixed(2)}
										</> : '0.0'} currency="dai"></ValueCounter>
									</div>
								</div>
								<div className="o-third">
									<div className="o-label">
										{t('IBCO.curveissuance')}
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
										{t('IBCO.buy')}
									</div>
									<div
										className={`c-transaction-selector --second ${tab == 'sell' ? '--selected' : ''}`}
										onClick={() => {handleTabChange('sell')}}
									>
										{t('IBCO.sell')}
									</div>
								</div>
							</div>
							<div className="o-row o-row__your_wallet">
								<h3 className="p-section-title">{t('IBCO.ur.wallet')}</h3>
								<ValueCounter value={ibcoIsReady ? <>
									{parseFloat(ethers.utils.formatEther(web3Context.state.ibcoDAIBalance).toString()).toFixed(2)}
								</> : '0.00'} currency="dai"></ValueCounter>

								<ValueCounter value={ibcoIsReady ? <>
									{parseFloat(ethers.utils.formatEther(web3Context.state.ibcoRewardBalance).toString()).toFixed(2)}
								</> : '0.00'}></ValueCounter>
							</div>
							<br></br>
							<div className="o-row">{t('IBCO.allowance')} {ibcoIsReady ? <>
								{parseFloat(ethers.utils.formatEther(web3Context.state.ibcoDAIAllowance).toString()).toFixed(0)}
							</> : '0.00'}</div>
							<div className="o-line"></div>
							<div className="o-row o-info-row">
								<div className="o-half"><h3 className="o-info-title">Price</h3></div>
								<div className="o-half --values-holder">
									<ValueCounter value={"1"} currency="ovr"></ValueCounter><span>=</span><ValueCounter value={ibcoOVRDAIPrice} currency="dai"></ValueCounter>
								</div>
							</div>
							<div className="o-row o-info-row">
								<div className="o-half"><h3 className="o-info-title">{t('IBCO.receive.amount')}</h3></div>
								<div className="o-half">

									{tab === "buy" ? <ValueCounter value={(transactionValue / ibcoOVRDAIPrice).toFixed(2)} currency="ovr"></ValueCounter>
										: <ValueCounter value={(transactionValue * ibcoOVRDAIPrice).toFixed(2)} currency="dai"></ValueCounter>}
								</div>
							</div>
							<div className="o-row o-info-row">
								<div className="o-half"><h3 className="o-info-title">{t('IBCO.slippage')}</h3></div>
								<div className="o-half">{(ibcoIsReady) ? <>
									{ethers.utils.formatEther(web3Context.state.ibcoCollateralDAI.slippage).toString()}
								</> : '0'} %</div>
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
							<h3 className="o-card-title">{t('IBCO.pending.transactions')}</h3>
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
							<h3 className="o-card-title">{t('IBCO.my.transactions')}</h3>
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
							<h3 className="o-card-title">{t('IBCO.curve.history')}</h3>
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
