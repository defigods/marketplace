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
					// web3Context.actions.ibcoPoll()
					
					setIbcoIsReady(true);
					setIbcoOVRDAIPrice(web3Context.state.ibcoCurrentOvrPrice);
					prepareIbcoCurveHistoryAndMyTrans();
					prepareIbcoMyOpenTransactions();
					renderPointsOnChart();

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
				transactionHash: claim.transactionHash,
			}
			openPending.push(nClaim);
		}
		for (const claim of web3Context.state.ibcoOpenSellOrders) {
			let nClaim = {
				type: 'Sell',
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
								<th>{t('IBCO.transaction.amountDai')}</th>
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
									<td className="">{trans.type}</td>
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
									<td><a href={config.apis.etherscan + 'tx/' + trans.transactionHash} rel="noopener noreferrer"target="_blank" className="view-on-etherscan-link">{t('ActivityTile.view.ether')}</a></td>
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
									<td className="min">{trans.type}</td>
									<td className="min --addr">{trans.public_address}</td>
									<td className="min">
										{trans.value == 0 ? <></> : <ValueCounter value={trans.value} currency="dai"></ValueCounter>}
										{trans.value == 0 ? <a href={config.apis.etherscan + 'tx/' + trans.transactionHash} rel="noopener noreferrer"target="_blank" className="view-on-etherscan-link">{t('ActivityTile.view.ether')}</a> : <></>}
									</td>
									{/* <td className="min">
										{trans.fee == 0 ? <></> : <ValueCounter value={trans.fee} currency="dai"></ValueCounter>}
									</td> */}
									<td className="min">
										{trans.amount == 0 ? <></> : <ValueCounter value={trans.amount} currency="ovr"></ValueCounter>}
										{trans.amount == 0 ? <a href={config.apis.etherscan + 'tx/' + trans.transactionHash} rel="noopener noreferrer"target="_blank" className="view-on-etherscan-link">{t('ActivityTile.view.ether')}</a> : <></>}

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
									<td className="min">{trans.type}</td>
									<td className="min">
										{trans.value == 0 ? <></> : <ValueCounter value={trans.value} currency="dai"></ValueCounter>}
										{trans.value == 0 ? <a href={config.apis.etherscan + 'tx/' + trans.transactionHash} rel="noopener noreferrer"target="_blank" className="view-on-etherscan-link">{t('ActivityTile.view.ether')}</a> : <></>}

									</td>
									{/* <td className="min">
										{trans.fee == 0 ? <></> : <ValueCounter value={trans.fee} currency="dai"></ValueCounter>}
									</td> */}
									<td className="min">
										{trans.amount == 0 ? <></> : <ValueCounter value={trans.amount} currency="ovr"></ValueCounter>}
										{trans.amount == 0 ? <a href={config.apis.etherscan + 'tx/' + trans.transactionHash} rel="noopener noreferrer"target="_blank" className="view-on-etherscan-link">{t('ActivityTile.view.ether')}</a> : <></>}
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

		// var data = ["10000","20000","30000","40000","50000","60000","70000","80000","90000","100000","200000","300000","400000","500000","600000","700000","800000","900000","1000000","1100000","1200000","1300000","1400000","1500000","1600000","1700000","1800000","1900000","2000000","2100000","2200000","2300000","2400000","2500000","2600000","2700000","2800000","2900000","3000000","3100000","3200000","3300000","3400000","3500000","3600000","3700000","3800000","3900000","4000000","4100000","4200000","4300000","4400000","4500000","4600000","4700000","4800000","4900000","5000000","5100000","5200000","5300000","5400000","5500000","5600000","5700000","5800000","5900000","6000000","6100000","6200000","6300000","6400000","6500000","6600000","6700000","6800000","6900000","7000000","7100000","7200000","7300000","7400000","7500000","7600000","7700000","7800000","7900000","8000000","8100000","8200000","8300000","8400000","8500000","8600000","8700000","8800000","8900000","9000000","9100000","9200000","9300000","9400000","9500000","9600000","9700000","9800000","9900000","10000000"]

		// function getX(x) { 
		// 	return initialSupplyToken*((Math.pow(((1+(x/connectorBalance))), CW))-1) 
		// }
		// var dataX = data.map(x => getX(x));

		// function getY(x, i) { 
		// 	return (x/dataX[i])
		// }
		// var dataY = data.map((x,i) => getY(x,i));

		var dataX = ["14","141091","278767","413195","544529","672914","798483","921361","1041665","1159504","1274980","2318367","3203228","3972515","4653676","5265341","5820754","6329667","6799480","7235941","7643606","8026149","8386577","8727382","9050654","9358164","9651422","9931731","10200223","10457883","10705578","10944075","11174053","11396119","11610817","11818635","12020014","12215355","12405019","12589339","12768616","12943128","13113131","13278858","13440527","13598337","13752476","13903114","14050413","14194523","14335583","14473724","14609068","14741730","14871817","14999431","15124667","15247616","15368361","15486984","15603559","15718160","15830853","15941703","16050772","16158117","16263795","16367858","16470356","16571338","16670848","16768931","16865628","16960979","17055023","17147796","17239332","17329667","17418831","17506856","17593772","17679606","17764388","17848142","17930894","18012670","18093491","18173382","18252364","18330458","18407685","18484064","18559615","18634355","18708303","18781475","18853889","18925561","18996505","19066737","19136273","19205125","19273308","19340835","19407718","19473972","19539607","19604635","19669068","19732918","19796195","19858909","19921070","19982690","20043777","20104341","20164391","20223935","20282984","20341545","20399626","20457236","20514382","20571072","20627314","20683115","20738481","20793420","20847939","20902044","20955742","21009038","21061940","21114452","21166582","21218334","21269715","21320730","21371383","21421681","21471629","21521231","21570492","21619418","21668012","21716281","21764227","21811856","21859171","21906178","21952880","21999281","22045385","22091196","22136718","22181955","22226911","22271588","22315991","22360122","22403987","22447586","22490925","22534006","22576833","22619408","22661734","22703815","22745653","22787251","22828613","22869740","22910636","22951304","22991745","23031963","23071960","23111738","23151300","23190649","23229786","23268715","23307437","23345955","23384270","23422386","23460304","23498026","23535555","23572892","23610039","23646999","23683773","23720364","23756773","23793002","23829053","23864927","23900627","23936154","23971510","24006697","24041716","24076569","24111257","24145783","24180147","24214352","24248399","24282289","24316023","24349604","24383033","24416311","24449439","24482419","24515253","24547941","24580485","24612887","24645147","24677266","24709247","24741091","24772797","24804369","24835806","24867111","24898283","24929326","24960238","24991023","25021680","25052211","25082617","25112898","25143057","25173094","25203010","25232806","25262483","25292042","25321484","25350809","25380020","25409117","25438100","25466971","25495731","25524379","25552919","25581349","25609671","25637887","25665996","25693999","25721898","25749693","25777385","25804974","25832463","25859850","25887138","25914326","25941416","25968408","25995303","26022102","26048805","26075413","26101928","26128348","26154676","26180912","26207056","26233110","26259073","26284947","26310732","26336429","26362038","26387560","26412996","26438345","26463610","26488790","26513886","26538899","26563828","26588676","26613441","26638126","26662730","26687253","26711697","26736062","26760349","26784558","26808689","26832743","26856721","26880622","26904449","26928200","26951877","26975480","26999009","27022465","27045849","27069161","27092401","27115569","27138667","27161695","27184653","27207541","27230361","27253112","27275794","27298409","27320957","27343438","27365852","27388200","27410483","27432700","27454853","27476941","27498965","27520925","27542821","27564655","27586427","27608136","27629783","27651368","27672893","27694357","27715760","27737104","27758387","27779611","27800777","27821883","27842931","27863921","27884854","27905729","27926547","27947308","27968013","27988662","28009255","28029793","28050275","28070703","28091076","28111395","28131660","28151871","28172029","28192134","28212186","28232185","28252132","28272028","28291872","28311664","28331405","28351096","28370736","28390325","28409865","28429355","28448795","28468186","28487529","28506822","28526067","28545264","28564413","28583514","28602567","28621574","28640533","28659446","28678312","28697132","28715905","28734633","28753316","28771953","28790545","28809092","28827594","28846052","28864466","28882835","28901161","28919444","28937682","28955878","28974031","28992141","29010209","29028234","29046217","29064158","29082058","29099916","29117733","29135508","29153243","29170937","29188590","29206203","29223776","29241309","29258802","29276256","29293670","29311045","29328381","29345678","29362937","29380156","29397338","29414482","29431587","29448655","29465685","29482677","29499633","29516551","29533432","29550277","29567085","29583856","29600591","29617291","29633954","29650581","29667173","29683729","29700250","29716735","29733186","29749602","29765983","29782329","29798641","29814919","29831163","29847373","29863549","29879691","29895800","29911875","29927917","29943926","29959903","29975846","29991756","30007634","30023480","30039293","30055075","30070824","30086541","30102227","30117881","30133504","30149095","30164655","30180184","30195682","30211149","30226586","30241992","30257367","30272713","30288028","30303313","30318568","30333793","30348988","30364154","30379291","30394398","30409475","30424524","30439544","30454535","30469497","30484430","30499335","30514211","30529060","30543879","30558671","30573435","30588171","30602879","30617560","30632213","30646838","30661436","30676007","30690551","30705068","30719558","30734021","30748457","30762867","30777250","30791607","30805937","30820242","30834520","30848772","30862998","30877198","30891373","30905522","30919646","30933744","30947817","30961864"]
		var dataY = ["0070","0072","0074","0075","0077","0079","0081","0082","0084","0086","0087","0105","0122","0139","0155","0172","0188","0205","0221","0237","0253","0270","0286","0301","0317","0333","0349","0365","0380","0396","0412","0427","0443","0458","0474","0489","0504","0520","0535","0550","0565","0581","0596","0611","0626","0641","0656","0671","0686","0701","0716","0731","0746","0761","0776","0791","0806","0821","0836","0850","0865","0880","0895","0910","0924","0939","0954","0968","0983","0998","1012","1027","1041","1056","1071","1085","1100","1114","1129","1143","1158","1172","1187","1201","1216","1230","1245","1259","1273","1288","1302","1316","1331","1345","1359","1374","1388","1402","1417","1431","1445","1460","1474","1488","1502","1516","1531","1545","1559","1573","1587","1602","1616","1630","1644","1658","1672","1686","1701","1715","1729","1743","1757","1771","1785","1799","1813","1827","1841","1855","1869","1883","1897","1911","1925","1939","1953","1967","1981","1995","2009","2023","2037","2051","2065","2079","2093","2107","2120","2134","2148","2162","2176","2190","2204","2218","2231","2245","2259","2273","2287","2301","2314","2328","2342","2356","2369","2383","2397","2411","2425","2438","2452","2466","2480","2493","2507","2521","2535","2548","2562","2576","2589","2603","2617","2630","2644","2658","2671","2685","2699","2712","2726","2740","2753","2767","2781","2794","2808","2822","2835","2849","2862","2876","2890","2903","2917","2930","2944","2958","2971","2985","2998","3012","3025","3039","3052","3066","3080","3093","3107","3120","3134","3147","3161","3174","3188","3201","3215","3228","3242","3255","3269","3282","3296","3309","3323","3336","3349","3363","3376","3390","3403","3417","3430","3444","3457","3470","3484","3497","3511","3524","3537","3551","3564","3578","3591","3604","3618","3631","3645","3658","3671","3685","3698","3711","3725","3738","3752","3765","3778","3792","3805","3818","3832","3845","3858","3872","3885","3898","3912","3925","3938","3951","3965","3978","3991","4005","4018","4031","4045","4058","4071","4084","4098","4111","4124","4137","4151","4164","4177","4190","4204","4217","4230","4243","4257","4270","4283","4296","4310","4323","4336","4349","4362","4376","4389","4402","4415","4428","4442","4455","4468","4481","4494","4508","4521","4534","4547","4560","4573","4587","4600","4613","4626","4639","4652","4666","4679","4692","4705","4718","4731","4744","4758","4771","4784","4797","4810","4823","4836","4849","4863","4876","4889","4902","4915","4928","4941","4954","4967","4980","4994","5007","5020","5033","5046","5059","5072","5085","5098","5111","5124","5137","5150","5164","5177","5190","5203","5216","5229","5242","5255","5268","5281","5294","5307","5320","5333","5346","5359","5372","5385","5398","5411","5424","5437","5450","5463","5476","5489","5502","5515","5528","5541","5554","5567","5580","5593","5606","5619","5632","5645","5658","5671","5684","5697","5710","5723","5736","5749","5762","5775","5788","5801","5814","5827","5840","5853","5865","5878","5891","5904","5917","5930","5943","5956","5969","5982","5995","6008","6021","6034","6047","6059","6072","6085","6098","6111","6124","6137","6150","6163","6176","6188","6201","6214","6227","6240","6253","6266","6279","6292","6304","6317","6330","6343","6356","6369","6382","6395","6407","6420","6433","6446","6459","6472","6485","6497","6510","6523","6536","6549","6562","6574","6587","6600","6613","6626","6639","6652","6664","6677","6690","6703","6716","6728","6741","6754","6767","6780","6793","6805","6818","6831","6844","6857","6869","6882","6895","6908","6921","6933","6946","6959","6972","6985","6997","7010","7023","7036","7048","7061","7074","7087","7100","7112","7125"]
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
				pointRadius: 3,
				pointHoverRadius: 7,
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
