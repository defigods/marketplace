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
	const [ibcoIsChartReady, setIbcoIsChartReady] = React.useState(false);
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
		if(ibcoIsReady === true){
			setTimeout(() => {
				renderChart()
			}, 1050);
		}
	}, [ibcoIsReady]);

	React.useEffect(() => {
		if(web3Context.state){
			if(web3Context.state.ibcoSetupComplete){
				if(web3Context.state.ibcoSetupComplete === true){
					// web3Context.actions.ibcoPoll()
					setIbcoIsReady(true);
					setIbcoOVRDAIPrice(web3Context.state.ibcoCurrentOvrPrice);
					prepareIbcoCurveHistoryAndMyTrans();
					prepareIbcoMyOpenTransactions();

					// Render Point on Chart ( and keep updated )
					if(ibcoIsChartReady === true){
						renderPointsOnChart();
					}
				}
			}
		}
	}, [web3Context]);

	React.useEffect(() => {
		prepareIbcoCurveHistoryAndMyTrans();
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
				setTransactionValueDescription(t('IBCO.exchange.buy', { OVRNumber: (transactionValue / ibcoOVRDAIPrice).toFixed(2), DAINumber: transactionValue }))
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
					console.log("CLAIM SELL", claim);

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
			}
			openPending.push(nClaim);
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
					<table className="Table TableFixed">
						<thead>
							<tr>
								<th>{t("IBCO.transaction.batchID")}</th>
								<th>{t('IBCO.transaction.type')}</th>
								<th>{t('IBCO.transaction.priceDai')}</th>
								{/* <th>Fee (DAI)</th> */}
								<th>{t('IBCO.transaction.amountOVR')}</th>
								<th>{t("IBCO.transaction.status")}</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{ibcoPendingTransactions.map((trans) => (
								<tr className="Table__line" key={trans.transactionHash}>
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
									<td className="">
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
									<td><a href={config.apis.etherscan + 'tx/' + trans.transactionHash} rel="noopener noreferrer" target="_blank" className="HexButton view-on-etherscan-link">{t('ActivityTile.view.ether')}</a></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}
	}

	function prepareIbcoCurveHistoryAndMyTrans(){
		let hClaim = [];
		let myClaim = [];
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
					if(claim.buyer === web3Context.state.address){ myClaim.push(nClaim) }
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

		var dataX = ["14","141091","278767","413195","544529","672914","798483","921361","1041665","1159504","1274980","2318367","3203228","3972515","4653676","5265341","5820754","6329667","6799480","7235941","7643606","8026149","8386577","8727382","9050654","9358164","9651422","9931731","10200223","10457883","10705578","10944075","11174053","11396119","11610817","11818635","12020014","12215355","12405019","12589339","12768616","12943128","13113131","13278858","13440527","13598337","13752476","13903114","14050413","14194523","14335583","14473724","14609068","14741730","14871817","14999431","15124667","15247616","15368361","15486984","15603559","15718160","15830853","15941703","16050772","16158117","16263795","16367858","16470356","16571338","16670848","16768931","16865628","16960979","17055023","17147796","17239332","17329667","17418831","17506856","17593772","17679606","17764388","17848142","17930894","18012670","18093491","18173382","18252364","18330458","18407685","18484064","18559615","18634355","18708303","18781475","18853889","18925561","18996505","19066737","19136273","19205125","19273308","19340835","19407718","19473972","19539607","19604635","19669068","19732918","19796195","19858909","19921070","19982690","20043777","20104341","20164391","20223935","20282984","20341545","20399626","20457236","20514382","20571072","20627314","20683115","20738481","20793420","20847939","20902044","20955742","21009038","21061940","21114452","21166582","21218334","21269715","21320730","21371383","21421681","21471629","21521231","21570492","21619418","21668012","21716281","21764227","21811856","21859171","21906178","21952880","21999281","22045385","22091196","22136718","22181955","22226911","22271588","22315991","22360122","22403987","22447586","22490925","22534006","22576833","22619408","22661734","22703815","22745653","22787251","22828613","22869740","22910636","22951304","22991745","23031963","23071960","23111738","23151300","23190649","23229786","23268715","23307437","23345955","23384270","23422386","23460304","23498026","23535555","23572892","23610039","23646999","23683773","23720364","23756773","23793002","23829053","23864927","23900627","23936154","23971510","24006697","24041716","24076569","24111257","24145783","24180147","24214352","24248399","24282289","24316023","24349604","24383033","24416311","24449439","24482419","24515253","24547941","24580485","24612887","24645147","24677266","24709247","24741091","24772797","24804369","24835806","24867111","24898283","24929326","24960238","24991023","25021680","25052211","25082617","25112898","25143057","25173094","25203010","25232806","25262483","25292042","25321484","25350809","25380020","25409117","25438100","25466971","25495731","25524379","25552919","25581349","25609671","25637887","25665996","25693999","25721898","25749693","25777385","25804974","25832463","25859850","25887138","25914326","25941416","25968408","25995303","26022102","26048805","26075413","26101928","26128348","26154676","26180912","26207056","26233110","26259073","26284947","26310732","26336429","26362038","26387560","26412996","26438345","26463610","26488790","26513886","26538899","26563828","26588676","26613441","26638126","26662730","26687253","26711697","26736062","26760349","26784558","26808689","26832743","26856721","26880622","26904449","26928200","26951877","26975480","26999009","27022465","27045849","27069161","27092401","27115569","27138667","27161695","27184653","27207541","27230361","27253112","27275794","27298409","27320957","27343438","27365852","27388200","27410483","27432700","27454853","27476941","27498965","27520925","27542821","27564655","27586427","27608136","27629783","27651368","27672893","27694357"]
		var dataY = ["0.070","0.071","0.072","0.073","0.073","0.074","0.075","0.076","0.077","0.078","0.078","0.086","0.094","0.101","0.107","0.114","0.120","0.126","0.132","0.138","0.144","0.150","0.155","0.160","0.166","0.171","0.176","0.181","0.186","0.191","0.196","0.201","0.206","0.211","0.215","0.220","0.225","0.229","0.234","0.238","0.243","0.247","0.252","0.256","0.260","0.265","0.269","0.273","0.278","0.282","0.286","0.290","0.294","0.298","0.303","0.307","0.311","0.315","0.319","0.323","0.327","0.331","0.335","0.339","0.343","0.347","0.350","0.354","0.358","0.362","0.366","0.370","0.374","0.377","0.381","0.385","0.389","0.392","0.396","0.400","0.404","0.407","0.411","0.415","0.418","0.422","0.426","0.429","0.433","0.436","0.440","0.444","0.447","0.451","0.454","0.458","0.461","0.465","0.469","0.472","0.476","0.479","0.483","0.486","0.489","0.493","0.496","0.500","0.503","0.507","0.510","0.514","0.517","0.520","0.524","0.527","0.531","0.534","0.537","0.541","0.544","0.547","0.551","0.554","0.558","0.561","0.564","0.567","0.571","0.574","0.577","0.581","0.584","0.587","0.591","0.594","0.597","0.600","0.604","0.607","0.610","0.613","0.617","0.620","0.623","0.626","0.629","0.633","0.636","0.639","0.642","0.645","0.649","0.652","0.655","0.658","0.661","0.665","0.668","0.671","0.674","0.677","0.680","0.683","0.687","0.690","0.693","0.696","0.699","0.702","0.705","0.708","0.711","0.715","0.718","0.721","0.724","0.727","0.730","0.733","0.736","0.739","0.742","0.745","0.748","0.751","0.754","0.758","0.761","0.764","0.767","0.770","0.773","0.776","0.779","0.782","0.785","0.788","0.791","0.794","0.797","0.800","0.803","0.806","0.809","0.812","0.815","0.818","0.821","0.824","0.827","0.830","0.833","0.836","0.838","0.841","0.844","0.847","0.850","0.853","0.856","0.859","0.862","0.865","0.868","0.871","0.874","0.877","0.880","0.882","0.885","0.888","0.891","0.894","0.897","0.900","0.903","0.906","0.909","0.912","0.914","0.917","0.920","0.923","0.926","0.929","0.932","0.935","0.937","0.940","0.943","0.946","0.949","0.952","0.955","0.957","0.960","0.963","0.966","0.969","0.972","0.974","0.977","0.980","0.983","0.986","0.989","0.991","0.994","0.997","1.000","1.003","1.006","1.008","1.011","1.014","1.017","1.020","1.022","1.025","1.028","1.031","1.034","1.036","1.039","1.042","1.045","1.048","1.050","1.053","1.056","1.059","1.061","1.064","1.067","1.070","1.072","1.075","1.078","1.081","1.084","1.086","1.089","1.092","1.095","1.097","1.100","1.103","1.106","1.108","1.111","1.114","1.116","1.119","1.122","1.125","1.127","1.130","1.133","1.136","1.138","1.141","1.144","1.146","1.149","1.152","1.155","1.157","1.160","1.163","1.165","1.168","1.171","1.174","1.176","1.179","1.182","1.184"]
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
		setIbcoIsChartReady(true);
	}

	function renderPointsOnChart(){
		if(hasPointRendered == false && ibcoOVRDAIPrice > 0.1){
			var newDataset = {
				data: [{x: parseFloat(ethers.utils.formatEther(web3Context.state.ibcoOVRSupply).toString()).toFixed(2), y: ibcoOVRDAIPrice}],
				backgroundColor: gradientStroke,
				label: "Starting price",
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
			{ibcoIsReady ? <>
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
								<div className={`chart-js ${ibcoIsChartReady === false ? '--hidd' : ''}`}>
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

export default PublicSale;
