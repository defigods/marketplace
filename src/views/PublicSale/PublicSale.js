import React, {useContext} from 'react';
import { useTranslation } from 'react-i18next'
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import HexButton from '../../components/HexButton/HexButton';
import TermsAndConditionsOverlay from '../../components/TermsAndConditionsOverlay/TermsAndConditionsOverlay'
import { Web3Context } from '../../context/Web3Context';
import { UserContext } from '../../context/UserContext';
import { warningNotification, successNotification} from '../../lib/notifications';
import CircularProgress from '@material-ui/core/CircularProgress';

import { ethers, BigNumber,utils } from 'ethers';
import bn from "bignumber.js";

import config from '../../lib/config';
import { useHistory,Link } from 'react-router-dom';

import CurrencyTextField from '@unicef/material-ui-currency-textfield'
import TextField from '@material-ui/core/TextField';

import {getCurrentLocale} from '../../i18n';

import Tooltip from '@material-ui/core/Tooltip';
import Help from '@material-ui/icons/Help';

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
	const [transactionValueExtimate, setTransactionValueExtimate] = React.useState(0.00);
	const [transactionValueDescription, setTransactionValueDescription] = React.useState(t('IBCO.exchange.buy', { OVRNumber: '0', DAINumber: '0' }));
	const [transactionValueValid, setTransactionValueValid] = React.useState(false);

	let history = useHistory();
	const web3Context = useContext(Web3Context);
	const userContext = useContext(UserContext);
	const { isLoggedIn: userAuthenticated } = userContext.state;

	const [ibcoPendingTransactions, setIbcoPendingTransactions] = React.useState([]);
	const [ibcoMyTransactions, setIbcoMyTransactions] = React.useState([]);
	const [ibcoCurveHistory, setIbcoCurveHistory] = React.useState([]);
	const [ibcoAreTermsAccepted, setIbcoAreTermsAccepted] = React.useState(false);
	const [ibcoIsKYCPassed, setIbcoIsKYCPassed] = React.useState(false);
	const [ibcoIsReady, setIbcoIsReady] = React.useState(false);
	const [ibcoIsChartReady, setIbcoIsChartReady] = React.useState(false);
	const [ibcoOVRDAIPrice, setIbcoOVRDAIPrice] = React.useState(0.1);
	const [ibcoSlippage, setIbcoSlippage] = React.useState(0.00);
	const [ibcoHasHistoryLoaded, setIbcoHasHistoryLoaded] = React.useState(false);
	
	const [hasMaxSlippageReached, setHasMaxSlippageReached] = React.useState(false);
	const [hasPointRendered, setHasPointRendered] = React.useState(false);
	const [shakeInput, setShakeInput] = React.useState(false);
	const [showTermsAndConditionsOverlay, setShowTermsAndConditionsOverlay] = React.useState(false);
	const [classShowPanels, setClassShowPanels] = React.useState(false);

	// Check if anything changed from web3context
	React.useEffect(() => {
		setIbcoPendingTransactions(web3Context.state.ibcoPendingTransactions)
		setIbcoMyTransactions(web3Context.state.ibcoMyTransactions)
		setIbcoCurveHistory(web3Context.state.ibcoCurveHistory) 
	}, [web3Context.state.ibcoPendingTransactions,web3Context.state.ibcoMyTransactions,web3Context.state.ibcoCurveHistory]);

	// Check if terms condition changed from userstate and kyc passed
	React.useEffect(() => {
		if(userContext.state.user.kycReviewAnswer === 1){
			setIbcoIsKYCPassed(true)
		}
	}, [userContext.state.user.kycReviewAnswer]);

	React.useEffect(() => {
		if(web3Context.state.ibcoLoadedHistory === true){
			setIbcoHasHistoryLoaded(true)
		} else {
			setIbcoHasHistoryLoaded(false)
		}
	}, [web3Context.state.ibcoLoadedHistory]);


	React.useEffect(() => {
		if(Boolean(userContext.state.user.ibcoAcceptedTerms) == true){
			setIbcoAreTermsAccepted(true)
		} else {
			setIbcoAreTermsAccepted(false)
		}			
	}, [userContext.state.user.kycReviewAnswer]);
	

	React.useEffect(() => {
		if(ibcoIsReady === true && userAuthenticated){
			setTimeout(() => {
				renderChart()
				setClassShowPanels(true);
			}, 200);
			
		}
	}, [ibcoIsReady]);

	React.useEffect(() => {
		if(web3Context.state){
			if(web3Context.state.ibcoSetupComplete){
				if(web3Context.state.ibcoSetupComplete === true){
					// web3Context.actions.ibcoPoll()
					setIbcoIsReady(true);
					setIbcoOVRDAIPrice(web3Context.state.ibcoCurrentOvrPrice);

					// Render Point on Chart ( and keep updated )
					if(ibcoIsChartReady === true){
						
					}
				}
			}
		}
	}, [web3Context]);

	React.useEffect(() => {
		prepareIbcoCurveHistory();
		prepareIbcoCurveMyTransactions();
		prepareIbcoMyOpenTransactions();
	}, [web3Context.state.ibcoClaims, web3Context.state.ibcoOpenBuyOrders, web3Context.state.ibcoOpenSellOrders]);


	// Interface helpers
	const handleTabChange = (newValue) => {
			setTab(newValue);
			setTransactionValueValid(false);
			if(newValue === 'sell'){
				setTransactionValue(0.0)
				setTransactionValueExtimate(0.0)
				setIbcoSlippage(0.00)
				setHasMaxSlippageReached(false)
				setTransactionValueDescription(t('IBCO.exchange.sell', { OVRNumber: 0, DAINumber: 0 }))
			} else {
				setTransactionValue(0.0)
				setTransactionValueExtimate(0.0)
				setIbcoSlippage(0.00)
				setHasMaxSlippageReached(false)
				setTransactionValueDescription(t('IBCO.exchange.buy', { OVRNumber: 0, DAINumber: 0 }))
			}
			
	};

	const handleTransactionValueChange = async (transaction) => {
			let balance = 0;
			let transactionValue = parseFloat(transaction);
			if(tab === 'sell'){
				balance = parseFloat(ethers.utils.formatEther(web3Context.state.ibcoRewardBalance).toString()).toFixed(2)
			} else {
				balance = parseFloat(ethers.utils.formatEther(web3Context.state.ibcoDAIBalance).toString()).toFixed(2)
			}

			if(!getCurrentLocale().includes('zh')){
				if (parseFloat(transactionValue) >= balance){
					setTransactionValue(balance);
					setShakeInput(true);
					setTransactionValueDescription(t("Warning.no.token.title"));
					setTimeout(() =>{
						setShakeInput(false);
					}, 400)
					return false;
				} else {
					setTransactionValue(transactionValue);
				}
				if( transactionValue > 0){
					setTransactionValueValid(true)
				} else {
					// To do allowance limit
					setTransactionValueValid(false)
				}
			} else {
				setTransactionValueValid(true)
				setTransactionValue(transactionValue);
			}


			let slip = 0;
			let maxSlip = parseFloat(ethers.utils.formatEther(web3Context.state.ibcoCollateralDAI.slippage).toString())*100;
			if(tab === 'sell'){
				let ret = await web3Context.actions.calculateCustomSellPrice(transactionValue);
				slip = await web3Context.actions.calculateCustomSellSlippage(transactionValue);
				setTransactionValueExtimate(ret);
				setTransactionValueDescription(t('IBCO.exchange.sell', { OVRNumber: transactionValue, DAINumber: ret }))
			} else {
				let ret = await web3Context.actions.calculateCustomBuyPrice(transactionValue);
				slip = await web3Context.actions.calculateCustomBuySlippage(transactionValue);
				setTransactionValueExtimate(ret);
				setTransactionValueDescription(t('IBCO.exchange.buy', { OVRNumber: ret, DAINumber: transactionValue }))
			}

			// Slippage
			if((slip*100).toFixed(2) >= 0){
				setIbcoSlippage((slip*100).toFixed(2));
			}
			if((slip*100).toFixed(2) >= maxSlip ){
				if(tab === 'buy'){
					// setHasMaxSlippageReached(true);
				}
			} else {
				setHasMaxSlippageReached(false);
			}
	};


	// Buy and Sell handle functions
	const handleApprove = async (val) => {
			let approve = await web3Context.state.ibcoDAISigner.approve(
					config.apis.curveAddress,
					new bn(val).times(mantissa).toFixed(0)
			);
			successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))
	};

	const handleBuyOvr = async (valueToBuy) => {
		// Check approval
		// console.log('AAA')
		if(web3Context.state.ibcoDAIAllowance < valueToBuy ){
			await handleApprove(1000000000000)
		}	
		// console.log('BBB')
		// Check your balance 
		if(parseFloat(ethers.utils.formatEther(web3Context.state.ibcoDAIBalance).toString()).toFixed(2) < valueToBuy){
			// console.log('CCC')
			warningNotification(t('Warning.no.token.title'), t('Warning.no.tokens.desc', { message: 'DAI' }));
		} else {
			// Open MetaMask
			// console.log('DDD')
			let open = await web3Context.state.ibcoController.openBuyOrder(
					config.apis.DAI,
					new bn(valueToBuy).times(mantissa).toFixed(0)
			);
			successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))
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
			successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))

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
					// let reward = await web3Context.state.ibcoRewardViewer.balanceOf(
					// 		web3Context.state.address
					// );
					// web3Context.actions.setRewardBalance(reward);
					successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))

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

					// let reward = await web3Context.state.ibcoRewardViewer.balanceOf(
					// 		web3Context.state.address
					// );
					// web3Context.actions.setRewardBalance(reward);
					successNotification(t("IBCO.request.process.title"),t("IBCO.request.process.desc"))

			} else {
					alert("Please wait one block for batch to mature");
			}
	};


	// Render Helpers for transactions

	function prepareIbcoMyOpenTransactions(){
		let openPending = [];
		for (const claim of web3Context.state.ibcoOpenBuyOrders) {
			let nClaim = {
				type: t("IBCO.buy"),
				typeUni: 'buy',
				batchId: claim.batchId,
				amount: 0,
				fee: parseFloat(ethers.utils.formatEther(claim.fee).toString()),
				value: parseFloat(ethers.utils.formatEther(claim.value).toString()),
				transactionHash: claim.transactionHash,
				duplicateBatch:false
			}
			if(claim.buyer.toLowerCase() === web3Context.state.address.toLowerCase()){ 
				// If there is another transaction per batch, mark as duplicate
				if(openPending.map(o => o.batchId._hex).includes(claim.batchId._hex)){
					nClaim.duplicateBatch = true;
				}
				// If there is a claimed transaction with same batchId
				if(web3Context.state.ibcoMyClaims.map(o => o.batchId._hex).includes(claim.batchId._hex)){
					// don't push as pending
				} else {
					openPending.push(nClaim) 	
				}
			}
		}
		for (const claim of web3Context.state.ibcoOpenSellOrders) {
			let nClaim = {
				type: t("IBCO.sell"),
				typeUni: 'sell',
				batchId: claim.batchId,
				amount: parseFloat(ethers.utils.formatEther(claim.amount).toString()),
				fee: 0,
				value: 0,
				transactionHash: claim.transactionHash,
				duplicateBatch:false
			}
			if(claim.seller.toLowerCase() === web3Context.state.address.toLowerCase()){ 
				// If there is another transaction per batch, mark as duplicate
				if(openPending.map(o => o.batchId._hex).includes(claim.batchId._hex)){
					nClaim.duplicateBatch = true;
				}
				// If there is a claimed transaction with same batchId
				if(web3Context.state.ibcoMyClaims.map(o => o.batchId._hex).includes(claim.batchId._hex)){
					// don't push as pending
				} else {
					openPending.push(nClaim) 	
				} 
			}
		}
		setIbcoPendingTransactions(openPending)
	}

	function renderClaimButton(trans){
		if(trans.duplicateBatch === true){
			return <>{t('IBCO.double.claim')}
			<Tooltip
				title={
					<React.Fragment>
						{t('IBCO.double.claim.tooltip')}
					</React.Fragment>
				}
				aria-label="info"
				placement="bottom"
			>
				<Help className="Help" />
			</Tooltip>
			</>
		}
		if(trans.typeUni.toLowerCase() === "sell"){
			return <div
					className="HexButton --orange"
					data-b={trans.batchId}
					onClick={handleClaimSell}
			>{t("IBCO.claim.sell")}</div>
		}
		if(trans.typeUni.toLowerCase() === "buy"){
			return <div
					className="HexButton --orange"
					data-b={trans.batchId}
					onClick={handleClaimBuy}
			>{t("IBCO.claim.buy")}</div>
		}
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
							{ibcoHasHistoryLoaded === false ? <div className="--pulse">Loading...</div> : t('IBCO.no.transactions')}
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="Table__container">
					<table className="Table TableFixed">
						<thead>
							<tr>
								<th>{t("IBCO.transaction.status")}</th>
								<th>{t("IBCO.transaction.batchID")}</th>
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
									<td className="">
										{renderClaimButton(trans)}
									</td>
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
										{trans.value == 0 ? <></> : <ValueCounter value={trans.value} currency="dai"></ValueCounter>}
										{trans.value == 0 ? <>{t('IBCO.after.claim')}</> : <></>}
										
									</td>
									{/* <td className="">
										{trans.fee == 0 ? <></> : <ValueCounter value={trans.fee} currency="dai"></ValueCounter>}
									</td> */}
									<td className="">
										{trans.amount == 0 ? <></> : <ValueCounter value={trans.amount} currency="ovr"></ValueCounter>}
										{trans.amount == 0 ? <>{t('IBCO.after.claim')}</> : <></>}
									</td>
									<td><a href={config.apis.etherscan + 'tx/' + trans.transactionHash} rel="noopener noreferrer" target="_blank" className="HexButton view-on-etherscan-link">{t('ActivityTile.view.ether')}</a></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}
	}

	function prepareIbcoCurveHistory(){
		let hClaim = [];
		for (const claim of web3Context.state.ibcoClaims) {
				if (claim.type === "ClaimBuyOrder") {
					let nClaim = {
						type: t("IBCO.buy"),
						typeUni: 'buy',
						batchId: claim.batchId._hex,
						public_address: claim.buyer,
						amount: parseFloat(ethers.utils.formatEther(claim.amount).toString()).toFixed(2),
						fee: 0,
						value: 0,
						transactionHash: claim.transactionHash
					}
					hClaim.push(nClaim);
				} else {
					let nClaim = {
						type:  t("IBCO.sell"),
						typeUni: 'sell',
						batchId: claim.batchId._hex,
						public_address: claim.seller,
						amount: 0,
						fee: parseFloat(ethers.utils.formatEther(claim.fee).toString()).toFixed(2),
						value: parseFloat(ethers.utils.formatEther(claim.value).toString()).toFixed(2),
						transactionHash: claim.transactionHash
					}
					hClaim.push(nClaim);
				}
		}
		setIbcoCurveHistory(hClaim)
	}

	function prepareIbcoCurveMyTransactions(){
		let myClaim = [];
		for (const claim of web3Context.state.ibcoMyClaims) {
				if (claim.type === "ClaimBuyOrder") {
					let nClaim = {
						type: t("IBCO.buy"),
						typeUni: 'buy',
						batchId: claim.batchId._hex,
						public_address: claim.buyer,
						amount: parseFloat(ethers.utils.formatEther(claim.amount).toString()).toFixed(2),
						fee: 0,
						value: 0,
						transactionHash: claim.transactionHash
					}
					myClaim.push(nClaim);
				} else {
					let nClaim = {
						type:  t("IBCO.sell"),
						typeUni: 'sell',
						batchId: claim.batchId._hex,
						public_address: claim.seller,
						amount: 0,
						fee: parseFloat(ethers.utils.formatEther(claim.fee).toString()).toFixed(2),
						value: parseFloat(ethers.utils.formatEther(claim.value).toString()).toFixed(2),
						transactionHash: claim.transactionHash
					}
					myClaim.push(nClaim);
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
							{ibcoHasHistoryLoaded === false ? <div className="--pulse">Loading...</div> : t('IBCO.no.transactions')}
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
										{trans.value == 0 ? <></> : <ValueCounter value={trans.value} currency="dai"></ValueCounter>}
										{trans.value == 0 ? <a href={config.apis.etherscan + 'tx/' + trans.transactionHash} rel="noopener noreferrer"target="_blank" className="HexButton view-on-etherscan-link">{t('ActivityTile.view.ether')}</a> : <></>}
									</td>
									{/* <td className="min">
										{trans.fee == 0 ? <></> : <ValueCounter value={trans.fee} currency="dai"></ValueCounter>}
									</td> */}
									<td className="min">
										{trans.amount == 0 ? <></> : <ValueCounter value={trans.amount} currency="ovr"></ValueCounter>}
										{trans.amount == 0 ? <a href={config.apis.etherscan + 'tx/' + trans.transactionHash} rel="noopener noreferrer"target="_blank" className="HexButton view-on-etherscan-link">{t('ActivityTile.view.ether')}</a> : <></>}

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
							{ibcoHasHistoryLoaded === false ? <div className="--pulse">Loading...</div> : t('IBCO.no.transactions')}
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
										{trans.value == 0 ? <></> : <ValueCounter value={trans.value} currency="dai"></ValueCounter>}
										{trans.value == 0 ? <a href={config.apis.etherscan + 'tx/' + trans.transactionHash} rel="noopener noreferrer" target="_blank" className="HexButton view-on-etherscan-link">{t('ActivityTile.view.ether')}</a> : <></>}

									</td>
									{/* <td className="min">
										{trans.fee == 0 ? <></> : <ValueCounter value={trans.fee} currency="dai"></ValueCounter>}
									</td> */}
									<td className="min">
										{trans.amount == 0 ? <></> : <ValueCounter value={trans.amount} currency="ovr"></ValueCounter>}
										{trans.amount == 0 ? <a href={config.apis.etherscan + 'tx/' + trans.transactionHash} rel="noopener noreferrer"  target="_blank" className="HexButton view-on-etherscan-link">{t('ActivityTile.view.ether')}</a> : <></>}
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
		// var initialSupplyToken = 81688155;
		// var connectorBalance = 114363.42;
		// var CW = 0.02;

		// var data = ["10000","20000","30000","40000","50000","60000","70000","80000","90000","100000","200000","300000","400000","500000","600000","700000","800000","900000","1000000","1100000","1200000","1300000","1400000","1500000","1600000","1700000","1800000","1900000","2000000","2100000","2200000","2300000","2400000","2500000","2600000","2700000","2800000","2900000","3000000","3100000","3200000","3300000","3400000","3500000","3600000","3700000","3800000","3900000","4000000","4100000","4200000","4300000","4400000","4500000","4600000","4700000","4800000","4900000","5000000","5100000","5200000","5300000","5400000","5500000","5600000","5700000","5800000","5900000","6000000","6100000","6200000","6300000","6400000","6500000","6600000","6700000","6800000","6900000","7000000","7100000","7200000","7300000","7400000","7500000","7600000","7700000","7800000","7900000","8000000","8100000","8200000","8300000","8400000","8500000","8600000","8700000","8800000","8900000","9000000","9100000","9200000","9300000","9400000","9500000","9600000","9700000","9800000","9900000","10000000"]

		// function getX(x) { 
		// 	return initialSupplyToken*((Math.pow(((1+(x/connectorBalance))), CW))-1) 
		// }
		// var dataX = data.map(x => getX(x));

		// function getY(x, i) { 
		// 	return (x/dataX[i])
		// }
		// var dataY = data.map((x,i) => getY(x,i));

		var dataX = ["14285","141030","278529","412674","543625","671534","796541","918778","1038366","1155419","1270044","2302147","3172427","3925359","4589220","5183124","5720601","6211585","6663587","7082428","7472708","7838129","8181711","8505957","8812957","9104481","9382036","9646919","9900256","10143024","10376084","10600194","10816026","11024179","11225189","11419539","11607660","11789948","11966757","12138413","12305213","12467427","12625305","12779077","12928954","13075131","13217790","13357098","13493213","13626279","13756431","13883798","14008497","14130641","14250332","14367669","14482745","14595646","14706455","14815248","14922099","15027077","15130248","15231674","15331413","15429523","15526056","15621062","15714591","15806688","15897397"]
		var dataY = ["0.0700","0.0718","0.0736","0.075","0.077","0.079","0.081","0.083","0.085","0.086","0.088","0.106","0.124","0.142","0.160","0.177","0.195","0.213","0.230","0.248","0.265","0.282","0.300","0.317","0.334","0.352","0.369","0.386","0.403","0.421","0.438","0.455","0.472","0.489","0.506","0.523","0.540","0.557","0.574","0.591","0.608","0.625","0.642","0.659","0.676","0.693","0.709","0.726","0.743","0.760","0.777","0.794","0.810","0.827","0.844","0.861","0.877","0.894","0.911","0.928","0.944","0.961","0.978","0.994","1.011","1.028","1.044","1.061","1.078","1.094","1.111","1.127","1.144","1.161","1.177","1.194"]
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
				scaleOverride: true,
				responsive: true,
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
		renderPointsOnChart();
	}

	function renderPointsOnChart(){
		if(hasPointRendered == false && ibcoOVRDAIPrice > 0.1){
			var newDataset = {
				data: [{x: web3Context.state.ibcoOVRSupply, y: (1/ibcoOVRDAIPrice).toFixed(4)}],
				backgroundColor: gradientStroke,
				label: "Buy Price",
				borderColor: '#5d509c',
				pointBackgroundColor:'#5d509c',
				borderWidth: 3,
				intersect: false,
				fill: true,
				borderDash: [0,0],
				pointRadius: 5,
				pointHoverRadius: 9,
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
					className={`--orange --large --kyc-button --only-butt`}
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
					className={`--orange --large --kyc-button --only-butt`}
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
				{getCurrentLocale().includes('zh') ? <TextField
					type="number"
					className={`${shakeInput ? "--shake":""}`}
					placeholder={"0.00"}
					onChange={(e) => {
						const eventBid = e.target.value;
						handleTransactionValueChange(eventBid);
					}}
				/> :
				<CurrencyTextField
				variant="outlined"
				currencySymbol="DAI"
				minimumValue={"0"}
				className={`${shakeInput ? "--shake":""}`}
				decimalCharacter="."
				digitGroupSeparator=","
				onChange={(event, value)=> {
					if(value>0){handleTransactionValueChange(value)};
				}}
					/>}
				

				<div className="--centered-button-holder">

					{hasMaxSlippageReached === true ? 
						<HexButton
							url="#"
							text={t('IBCO.max.slippage.reached')}
							className={`--orange --large --kyc-button --warning`}
						></HexButton>
						: <HexButton
							url="#"
							text={transactionValueDescription}
							className={`--orange --large --kyc-button ${transactionValueValid == false ? '--disabled' : ''}`}
							// ${bidValid ? '' : '--disabled'}
							onClick={() => handleBuyOvr(transactionValue)}
						></HexButton>}
				</div>
			</div>
		</div>)
		} else {
			return (
			<div className="i-ibco-input">
				<div>
					{getCurrentLocale().includes('zh') ? <TextField
						type="number"
						className={`${shakeInput ? "--shake":""}`}
						placeholder={"0.00"}
						onChange={(e) => {
							const eventBid = e.target.value;
							handleTransactionValueChange(eventBid);
						}}
					/> :
					<CurrencyTextField
					variant="outlined"
					currencySymbol="OVR"
					minimumValue={"0"}
					className={`${shakeInput ? "--shake":""}`}
					decimalCharacter="."
					digitGroupSeparator=","
					onChange={(event, value)=> {
						if(value>0){handleTransactionValueChange(value)};
					}}
						/>}
					<div className="--centered-button-holder">
						{hasMaxSlippageReached === true ? 
							<HexButton
								url="#"
								text={t('IBCO.max.slippage.reached')}
								className={`--orange --large --kyc-button --warning`}
							></HexButton>
							: <HexButton
								url="#"
								text={transactionValueDescription}
								className={`--purple --large --kyc-button ${transactionValueValid == false ? '--disabled' : ''}`}
								// ${bidValid ? '' : '--disabled'}
								onClick={() => handleSellOvr(transactionValue)}
							></HexButton>}
					</div>
				</div>
			</div>)
		}
	}

	const PublicSaleContentLoginRequired = () => {
		const { t, i18n } = useTranslation();
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
					<div className="c-dialog-sub-title">{t('PublicSale.login.required.desc')}</div>
				</div>
			</div>
		</div>
		)	
	};

	if (!userAuthenticated) {
		return <PublicSaleContentLoginRequired t={t}/>;
	} else {
		return (
			<div className={`PublicSale ${classShowPanels ? '--js-show' : ''}`}>
				{ibcoIsReady ? <>
				<TermsAndConditionsOverlay disableTermsAndConditionsOverlay={()=>toggleTermsAndConditionsOverlay(false)} showOverlay={showTermsAndConditionsOverlay}/>
				<div className="o-container">
					<div className="--flex">
						<div className="s-f-curve">
							<div className="o-card --chart-js --card-1">
								<div className="o-row --chart-header">
									<div className="o-one-label">
										<div className="o-label">
											{t('IBCO.buyprice')}
										</div>
										<div className="o-value">
											<ValueCounter value={(1/ibcoOVRDAIPrice).toFixed(4)} currency="dai"></ValueCounter>
										</div>
									</div>
									<div className="o-one-label">
										<div className="o-label">
											{t('IBCO.reserve')}
										</div>
										<div className="o-value">
											<ValueCounter value={ibcoIsReady ? parseFloat(ethers.utils.formatEther(web3Context.state.ibcoDAIReserve).toString()).toFixed(2).toString() : '0.0'} currency="dai"></ValueCounter>
										</div>
									</div>
									<div className="o-one-label">
										<div className="o-label">
											{t('IBCO.curveissuance')}
										</div>
										<div className="o-value">
											<ValueCounter value={ibcoIsReady ? web3Context.state.ibcoOVRSupply : '0.0'}></ValueCounter>
										</div>
									</div>
								</div>
								<div className="o-row">
									<div className={`chart-js ${ibcoIsChartReady === false ? '--hidd' : ''}`}>
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
									<ValueCounter value={ibcoIsReady ? parseFloat(ethers.utils.formatEther(web3Context.state.ibcoDAIBalance).toString()).toFixed(2) : '0.00'} currency="dai"></ValueCounter>
									<ValueCounter value={ibcoIsReady ? parseFloat(ethers.utils.formatEther(web3Context.state.ibcoRewardBalance).toString()).toFixed(2) : '0.00'}></ValueCounter>
								</div>
								<br></br>
								<div className="o-row">{t('IBCO.allowance')} {ibcoIsReady ? parseFloat(ethers.utils.formatEther(web3Context.state.ibcoDAIAllowance).toString()).toFixed(0) : '0.00'}</div>
								<div className="o-line"></div>
								<div className="o-row o-info-row">
									<div className="o-half"><h3 className="o-info-title">Price</h3></div>
									<div className="o-half --values-holder">
										<ValueCounter value={"1"} currency="dai"></ValueCounter><span>=</span><ValueCounter value={ibcoOVRDAIPrice} currency="ovr"></ValueCounter>
									</div>
								</div>
								<div className="o-row o-info-row">
									<div className="o-half"><h3 className="o-info-title">{t('IBCO.receive.amount')}</h3></div>
									<div className="o-half">

										{tab === "buy" ? <ValueCounter value={transactionValueExtimate} currency="ovr"></ValueCounter>
											: <ValueCounter value={transactionValueExtimate} currency="dai"></ValueCounter>}
									</div>
								</div>
								<div className="o-row o-info-row">
									<div className="o-half"><h3 className="o-info-title">{t('IBCO.max.slippage')}</h3></div>
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
						<div className="o-card --card-3">
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
						<div className="o-card --card-4">
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
				</>: <>
				<div className="PublicSale__loading_interface">
					<span className="Loader__cont">
						<CircularProgress />
						<span>Loading</span>
					</span>
				</div>
				</>}

			</div>
		);
	}
}

export default PublicSale;
