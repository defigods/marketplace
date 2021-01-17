import React, { createContext, Component } from 'react';
import { removeToken, saveToken, isLogged, getToken, removeUser, getPublicAddress } from '../lib/auth';
import { successNotification, networkError, dangerNotification, warningNotification } from '../lib/notifications';
import {
	userProfile,
	getUserNonce,
	signUpPublicAddress,
	signIn,
	sendPreAuctionStart,
	sendConfirmAuctionStart,
	sendPreAuctionBid,
	signUpLoginMetamask,
	getGasPrice,
	updateLandMarketStatusIfHasBeenMinted,
} from '../lib/api';
import { promisify } from '../lib/config';
import config from '../lib/config';
import { promisifyAll } from 'bluebird';
import { ethers, BigNumber, utils } from 'ethers';
import { UserContext } from './UserContext';
import { useHistory } from 'react-router-dom';
import { abi } from '../contract/abi';
import ovrAbi from '../contract/ovrAbi';
import bn from 'bignumber.js';

const controllerABI = require('../contract/controllerABI');
const curveABI = require('../contract/curveABI');
const DAIABI = require('../contract/DAIABI');
const rewardABI = require('../contract/rewardABI');
const bancorFormulaABI = require('../contract/bancorFormulaABI');
const vestingABI = require('../contract/vestingABI');
const stakingABI = require('../contract/stakingABI');
const lightMintingABI = require('../contract/lightMintingABI');
const merkleDistributorABI = require('../contract/merkleDistributorABI');

const premine = BigNumber.from(81688155);
const initialVirtualBalance = BigNumber.from(371681).mul(BigNumber.from(10 ** 9).mul(BigNumber.from(10 ** 9)));
const mantissa = new bn(1e18);


console.log('VALUE',ethers.utils.formatEther('0x0a3441f432e61a0000').toString())

export const Web3Context = createContext();

export class Web3Provider extends Component {
	static contextType = UserContext;
	constructor(props) {
		super(props);
		this.state = {
			setupComplete: false,
			ibcoSetupComplete: false,
			ibcoLoadedHistory: false,
			provider: null,
			signer: null,
			address: null,
			ovrsOwned: 0,
			gasLandCost: 0,
			perEth: 0,
			perUsd: 0,
			ibcoCurrentOvrPrice: 0.06,
			lastTransaction: '0x0',
			ibcoOpenBuyOrders: [],
			ibcoOpenSellOrders: [],
			ibcoClaims: [],
			ibcoMyClaims: [],
		};
	}

	//
	//	Setup web3 and centralized login
	//

	componentDidMount() {
		// If logged setup Web3
		if (isLogged()) {
			this.setupWeb3((res) => {
				if (res == false) {
					this.context.actions.logoutUser();
				}
			}, false);
		}
	}

	setupWeb3 = async (callback, login = true, showNotification = true) => {
		if (typeof web3 !== 'undefined') {
			await window.ethereum.enable();
			let provider = new ethers.providers.Web3Provider(window.ethereum);
			let network = await provider.getNetwork();
			let chainId = network.chainId;
			let signer = provider.getSigner(0);
			let address = await signer.getAddress();

			if (address == undefined) {
				// Metamask found, but not logged in
				callback(false);
			} else {
				// Metamask found, logged in, check chainId
				let web3NetworkVersion = parseInt(chainId) === config.web3network;
				if (web3NetworkVersion === false) {
					// Wrong Network
					if (showNotification === true) {
						warningNotification(
							this.props.t('Warning.metamask.wrong.network.title'),
							this.props.t('Warning.metamask.wrong.network.desc'),
						);
					}
					callback(false);
					return false;
				}

				// Metamask found, logged in, chainId correct

				let block = await provider.getBlock();
				await this.setState({ ibcoBlock: BigNumber.from(block.number) });

				this.setState({
					provider: provider,
					signer: signer,
					address: address,
					chainId: chainId,
					setupComplete: true,
				});

				// Intialize contracts
				let data = await this.initializeContracts();
				await this.setSigners(data);

				// Centralized Login
				if (login == true) {
					await this.handleCentralizedLogin(address, callback);
				}
				this.keepUpdatedGasPrice();
				this.keepUpdatedPublicAddress();
			}
		} else {
			// Metamask not detected
			warningNotification(
				this.props.t('Warning.metamask.not.detected.title'),
				this.props.t('Warning.metamask.not.detected.desc'),
			);
			callback(false);
			return false;
		}
	};

	//
	// IBCO
	//

	setSigners = async (data) => {
		this.setState({
			ibcoController: data.controllerSigner,
			ibcoControllerViewer: data.controllerViewer,
			ibcoCurveViewer: data.curveViewer,
			ibcoDAISigner: data.DAISigner,
			ibcoDAIViewer: data.DAIViewer,
			ibcoRewardSigner: data.rewardSigner,
			ibcoRewardViewer: data.rewardViewer,
			ibcoBancorFormulaViewer: data.bancorViewer,
			VestOVRGSigner: data.vestingOVRGSigner,
			VestOVRGViewer: data.vestingOVRGViewer,
			VestOVRG15Signer: data.vestingOVRG15Signer,
			VestOVRG15Viewer: data.vestingOVRG15Viewer,
			VestOVRG30Signer: data.vestingOVRG30Signer,
			VestOVRG30Viewer: data.vestingOVRG30Viewer,
			tokenOVRGSigner: data.OVRGSigner,
			tokenOVRGViewer: data.OVRGViewer,
			tokenOVRG15Signer: data.OVRG15Signer,
			tokenOVRG15Viewer: data.OVRG15Viewer,
			tokenOVRG30Signer: data.OVRG30Signer,
			tokenOVRG30Viewer: data.OVRG30Viewer,
			StakeOVRSigner: data.stakingOVRSigner,
			StakeOVRViewer: data.stakingOVRViewer,
			StakeOVRGSigner: data.stakingOVRGSigner,
			StakeOVRGViewer: data.stakingOVRGViewer,
			StakeOVRG15Signer: data.stakingOVRG15Signer,
			StakeOVRG15Viewer: data.stakingOVRG15Viewer,
			StakeOVRG30Signer: data.stakingOVRG30Signer,
			StakeOVRG30Viewer: data.stakingOVRG30Viewer,
			lightMintingSigner: data.lightMintingSigner,
			MerkleDistributorSigner: data.merkleDistributorSigner,
			MerkleDistributorViewer: data.merkleDistributorViewer,
		});
		this.initializeStore();
	};

	initializeStore = async () => {
		// contract data storage initialization
		// current Batch ID
		let batchId = await this.state.ibcoCurveViewer.getCurrentBatchId();
		this.setState({
			ibcoBatchId: batchId,
		});

		// DAI collateral
		let DAI = await this.state.ibcoCurveViewer.getCollateralToken(config.apis.DAI);
		this.setState({
			ibcoCollateralDAI: {
				whitelisted: DAI[0],
				virtualSupply: DAI[1],
				virtualBalance: DAI[2],
				reserveRatio: DAI[3],
				slippage: DAI[4],
			},
		});

		// Reward token balance
		let reward = await this.state.ibcoRewardViewer.balanceOf(this.state.address);
		this.setState({
			ibcoRewardBalance: reward,
		});
		// console.log('parseFloat(ethers.utils.formatEther(reward).toString())',parseFloat(ethers.utils.formatEther(reward).toString()))
		this.context.actions.setUserBalance(parseFloat(ethers.utils.formatEther(reward).toString()));

		// DAI balance of user
		let balance = await this.state.ibcoDAIViewer.balanceOf(this.state.address);
		this.setState({
			ibcoDAIBalance: balance,
		});

		// DAI balance of bonding curve
		let reserve = await this.state.ibcoDAIViewer.balanceOf(config.apis.curveAddress);
		this.setState({
			ibcoDAIReserve: reserve,
		});

		// Total supply of OVR Token
		let TotalOVRSupply = await this.state.ibcoRewardViewer.totalSupply();
		let CurveOVRSupply = TotalOVRSupply.sub(premine.mul(BigNumber.from(10 ** 9).mul(BigNumber.from(10 ** 9))));

		let doublePremine = premine.mul(BigNumber.from(2)).mul(BigNumber.from(10 ** 9).mul(BigNumber.from(10 ** 9)))
		let vsBancorFormula = doublePremine.add(CurveOVRSupply)
		
		// Fallback bug
		if( CurveOVRSupply.isNegative() ){
			CurveOVRSupply = (parseFloat(ethers.utils.formatEther(reserve).toString()) / 0.07).toFixed(2)
		} 

		this.setState({
			ibcoOVRSupply: CurveOVRSupply,
			ibcoTotalOVRSupply: TotalOVRSupply,
			ibcoDoublePremine: doublePremine,
			ibcoVsBancorFormula: vsBancorFormula,
		});

		// Allowance of DAI spendable by curve contract
		let allowance = await this.state.ibcoDAIViewer.allowance(this.state.address, config.apis.curveAddress);
		this.setState({
			ibcoDAIAllowance: allowance,
		});

		// price of next Token
		let res = this.state.ibcoDAIReserve.toString() === '0' ? BigNumber.from(1) : this.state.ibcoDAIReserve;

		let virtualResBancorFormula = res.add(initialVirtualBalance);
		this.setState({
			ibcoVirtualResBancorFormula: virtualResBancorFormula,
		});

		let price1 = await this.state.ibcoBancorFormulaViewer.calculatePurchaseReturn(
			vsBancorFormula,
			virtualResBancorFormula,
			config.apis.connectorWeight,
			BigNumber.from(10 ** 9).mul(BigNumber.from(10 ** 9)),
		);
		this.setState({
			ibcoPrice1: price1,
		});

		// priceOVR
		let priceOvr = parseFloat(ethers.utils.formatEther(price1).toString()).toFixed(3);
		this.setState({
			ibcoCurrentOvrPrice: priceOvr,
		});

		// Start setting up History and Poll
		await this.startHistoricLoop();
		this.ibcoPoll();
	};

	startHistoricLoop = async () => {
		// Loop trough blocks
		let fromBlock = config.apis.firstOVRBlock;
		let toBlock = config.apis.firstOVRBlock + 9999;
		let nowBlock = this.state.ibcoBlock.toNumber();
		while (toBlock <= nowBlock) {
			await this.historicData(fromBlock, toBlock);
			fromBlock = toBlock + 1;
			toBlock = fromBlock + 9999;
		}
		await this.historicData(fromBlock + 1, nowBlock);

		// Setup final state
		this.setState({
			ibcoLoadedHistory: true,
			ibcoSetupComplete: true,
			ibcoOpenBuyOrders: this.state.ibcoOpenBuyOrders.reverse(),
			ibcoMyClaims: this.state.ibcoMyClaims.reverse(),
			ibcoOpenSellOrders: this.state.ibcoOpenSellOrders.reverse(),
			ibcoClaims: this.state.ibcoClaims.reverse().slice(0, 15),
		});
	};

	// Calculate adapted price
	calculateCustomBuyPrice = async (val) => {
		let amountInput = val.toString() === '0' ? mantissa.toFixed(0) : new bn(val).times(mantissa).toFixed(0);

		let newPrice = await this.state.ibcoBancorFormulaViewer.calculatePurchaseReturn(
			this.state.ibcoVsBancorFormula,
			this.state.ibcoVirtualResBancorFormula,
			config.apis.connectorWeight,
			amountInput,
		);
		return parseFloat(ethers.utils.formatEther(newPrice).toString()).toFixed(3);
	};

	calculateCustomSellPrice = async (val) => {
		let amountInput = val.toString() === '0' ? mantissa.toFixed(0) : new bn(val).times(mantissa).toFixed(0);

		let newPrice = await this.state.ibcoBancorFormulaViewer.calculateSaleReturn(
			this.state.ibcoVsBancorFormula,
			this.state.ibcoVirtualResBancorFormula,
			config.apis.connectorWeight,
			amountInput,
		);
		return parseFloat(ethers.utils.formatEther(newPrice).toString()).toFixed(3);
	};

	calculateCustomSellSlippage = async (val) => {
		let amountInput = val.toString() === '0' ? mantissa.toFixed(0) : new bn(val).times(mantissa).toFixed(0);

		let newPrice = await this.state.ibcoBancorFormulaViewer.calculateSaleReturn(
			this.state.ibcoVsBancorFormula,
			this.state.ibcoVirtualResBancorFormula,
			config.apis.connectorWeight,
			amountInput,
		);
		let pricePerToken = parseFloat(ethers.utils.formatEther(newPrice).toString()) / val;
		// console.log('pricePerToken STIMATO', pricePerToken)
		// console.log('pricePerToken CURRENT', (1/this.state.ibcoCurrentOvrPrice))
		let slippage =
			((parseFloat(1 / this.state.ibcoCurrentOvrPrice) - pricePerToken) /
				parseFloat(1 / this.state.ibcoCurrentOvrPrice)) *
			100;
		// console.log('slippage', slippage)
		return slippage;
	};

	calculateCustomBuySlippage = async (val) => {
		let amountInput = val.toString() === '0' ? mantissa.toFixed(0) : new bn(val).times(mantissa).toFixed(0);

		let newPrice = await this.state.ibcoBancorFormulaViewer.calculatePurchaseReturn(
			this.state.ibcoVsBancorFormula,
			this.state.ibcoVirtualResBancorFormula,
			config.apis.connectorWeight,
			amountInput,
		);
		let pricePerToken = parseFloat(ethers.utils.formatEther(newPrice).toString()).toFixed(3) / val;

		// console.log('pricePerToken STIMATO', pricePerToken)
		// console.log('pricePerToken CURRENT', (this.state.ibcoCurrentOvrPrice))
		let slippage =
			((parseFloat(this.state.ibcoCurrentOvrPrice) - pricePerToken) / parseFloat(this.state.ibcoCurrentOvrPrice)) * 100;
		// console.log('slippage', slippage)
		return slippage;
	};

	// initialize all contracts as signer and viewer objects, which allow functions to be called from the blockchain
	// signers call functions which mutate chain state and cost gas
	// viewers call public view functions to retreive data without costing gas
	initializeContracts = async () => {
		let controllerSigner = new ethers.Contract(config.apis.controllerAddress, controllerABI, this.state.signer);
		let controllerViewer = new ethers.Contract(config.apis.controllerAddress, controllerABI, this.state.provider);
		let curveViewer = new ethers.Contract(config.apis.curveAddress, curveABI, this.state.provider);
		let DAISigner = new ethers.Contract(config.apis.DAI, DAIABI, this.state.signer);
		let DAIViewer = new ethers.Contract(config.apis.DAI, DAIABI, this.state.provider);
		let rewardSigner = new ethers.Contract(config.apis.RewardToken, rewardABI, this.state.signer);
		let rewardViewer = new ethers.Contract(config.apis.RewardToken, rewardABI, this.state.provider);
		let bancorViewer = new ethers.Contract(config.apis.BancorFormula, bancorFormulaABI, this.state.provider);

		let vestingOVRGSigner = new ethers.Contract(config.apis.VestingOVRG, vestingABI, this.state.signer);

		let vestingOVRGViewer = new ethers.Contract(config.apis.VestingOVRG, vestingABI, this.state.provider);

		let vestingOVRG15Signer = new ethers.Contract(config.apis.VestingOVRG15, vestingABI, this.state.signer);

		let vestingOVRG15Viewer = new ethers.Contract(config.apis.VestingOVRG15, vestingABI, this.state.provider);

		let vestingOVRG30Signer = new ethers.Contract(config.apis.VestingOVRG30, vestingABI, this.state.signer);

		let vestingOVRG30Viewer = new ethers.Contract(config.apis.VestingOVRG30, vestingABI, this.state.provider);
		let OVRGSigner = new ethers.Contract(config.apis.OVRG, ovrAbi, this.state.signer);
		let OVRGViewer = new ethers.Contract(config.apis.OVRG, ovrAbi, this.state.provider);
		let OVRG15Signer = new ethers.Contract(config.apis.OVRG15, ovrAbi, this.state.signer);
		let OVRG15Viewer = new ethers.Contract(config.apis.OVRG15, ovrAbi, this.state.provider);
		let OVRG30Signer = new ethers.Contract(config.apis.OVRG30, ovrAbi, this.state.signer);
		let OVRG30Viewer = new ethers.Contract(config.apis.OVRG30, ovrAbi, this.state.provider);
		let stakingOVRSigner = new ethers.Contract(config.apis.stakingOVR, stakingABI, this.state.signer);

		let stakingOVRViewer = new ethers.Contract(config.apis.stakingOVR, stakingABI, this.state.provider);
		let stakingOVRGSigner = new ethers.Contract(config.apis.stakingOVRG, stakingABI, this.state.signer);

		let stakingOVRGViewer = new ethers.Contract(config.apis.stakingOVRG, stakingABI, this.state.provider);

		let stakingOVRG15Signer = new ethers.Contract(config.apis.stakingOVRG15, stakingABI, this.state.signer);

		let stakingOVRG15Viewer = new ethers.Contract(config.apis.stakingOVRG15, stakingABI, this.state.provider);

		let stakingOVRG30Signer = new ethers.Contract(config.apis.stakingOVRG30, stakingABI, this.state.signer);

		let stakingOVRG30Viewer = new ethers.Contract(config.apis.stakingOVRG30, stakingABI, this.state.provider);

		let lightMintingSigner = new ethers.Contract(config.apis.lightMinting, lightMintingABI, this.state.signer);

		let merkleDistributorSigner = new ethers.Contract(
			config.apis.merkleDistributor,
			merkleDistributorABI,
			this.state.signer,
		);

		let merkleDistributorViewer = new ethers.Contract(
			config.apis.merkleDistributor,
			merkleDistributorABI,
			this.state.provider,
		);

		let data = {
			controllerSigner,
			controllerViewer,
			curveViewer,
			DAISigner,
			DAIViewer,
			rewardSigner,
			rewardViewer,
			bancorViewer,
			vestingOVRGSigner,
			vestingOVRGViewer,
			vestingOVRG15Signer,
			vestingOVRG15Viewer,
			vestingOVRG30Signer,
			vestingOVRG30Viewer,
			OVRGSigner,
			OVRGViewer,
			OVRG15Signer,
			OVRG15Viewer,
			OVRG30Signer,
			OVRG30Viewer,
			stakingOVRSigner,
			stakingOVRViewer,
			stakingOVRGSigner,
			stakingOVRGViewer,
			stakingOVRG15Signer,
			stakingOVRG15Viewer,
			stakingOVRG30Signer,
			stakingOVRG30Viewer,
			lightMintingSigner,
			merkleDistributorSigner,
			merkleDistributorViewer,
		};
		return data;
	};

	updateBalances = async () => {
		// current DAI balance user
		let balance = await this.state.ibcoDAIViewer.balanceOf(this.state.address);
		this.setState({
			ibcoDAIBalance: balance,
		});

		// current OVR Balance user
		let reward = await this.state.ibcoRewardViewer.balanceOf(this.state.address);
		this.setState({
			ibcoRewardBalance: reward,
		});
		// console.log('parseFloat(ethers.utils.formatEther(reward).toString())',parseFloat(ethers.utils.formatEther(reward).toString()))
		this.context.actions.setUserBalance(parseFloat(ethers.utils.formatEther(reward).toString()));

		// current DAI balance reserve
		let reserve = await this.state.ibcoDAIViewer.balanceOf(config.apis.curveAddress);
		this.setState({
			ibcoDAIReserve: reserve,
		});

		// price of next Token
		//check if Reserve is zero. It it's zero, add 1
		let res = this.state.ibcoDAIReserve.toString() === '0' ? BigNumber.from(1) : this.state.ibcoDAIReserve;
		let virtualResBancorFormula = res.add(initialVirtualBalance);

		let price1 = await this.state.ibcoBancorFormulaViewer.calculatePurchaseReturn(
			//supply,balance,weight, amount
			this.state.ibcoVsBancorFormula,
			virtualResBancorFormula,
			config.apis.connectorWeight,
			BigNumber.from(10 ** 9).mul(BigNumber.from(10 ** 9)),
		);
		this.setState({
			ibcoPrice1: price1,
		});

		// priceOVR
		let priceOvr = parseFloat(ethers.utils.formatEther(price1).toString()).toFixed(3);
		this.setState({
			ibcoCurrentOvrPrice: priceOvr,
		});

		// Allowance of DAI spendable by curve contract
		let allowance = await this.state.ibcoDAIViewer.allowance(this.state.address, config.apis.curveAddress);
		this.setState({
			ibcoDAIAllowance: allowance,
		});
	};

	ibcoPoll = async () => {
		const openBuyOrderFilter = {
			address: config.apis.curveAddress,
			topics: [
				[
					utils.id('OpenBuyOrder(address,uint256,address,uint256,uint256'),
					utils.id('OpenSellOrder(address,uint256,address,uint256)'),
					utils.id('ClaimBuyOrder(address,uint256,address,uint256)'),
					utils.id('ClaimSellOrder(address,uint256,address,uint256'),
				],
			],
		};

		this.state.provider.on(openBuyOrderFilter, (log) => {
			// console.log("FILTER FIRE: ", log);
		});

		// this function contains all of the event listeners

		// Event: new block is mined - fetches the most current batchId
		this.state.provider.on('block', async (block) => {
			this.setState({
				ibcoBlock: block,
			});
			let batchId = await this.state.ibcoCurveViewer.getCurrentBatchId();
			this.setState({
				ibcoBatchId: batchId,
			});
		});

		// Event: new batch is created after calling an order. Does not fire on every new batch, only on order function calls.
		this.state.ibcoCurveViewer.on('NewBatch', async (batch) => {
			// console.log("NEW BATCH: ", batch);
		});

		// Event: DAI is approved from transfer
		// console.log("FILL DAI VIEWER: ", this.state.ibcoDAIViewer);
		this.state.ibcoDAIViewer.on('Approval', async (owner, spender, amount) => {
			await this.updateBalances();
		});

		// Event: openBuyOrder is successfully called. Updates the state of openBuyOrder
		this.state.ibcoCurveViewer.on('OpenBuyOrder', async (buyer, batchId, collateral, fee, value, event) => {
			let receipt = await event.getTransactionReceipt();
			// transactionHash
			let oBuy = [
				{
					buyer: buyer,
					batchId: batchId,
					collateral: collateral,
					fee: fee,
					value: value,
					transactionHash: receipt.transactionHash,
				},
			];
			this.appendOpenBuyOrders(oBuy);
			await this.updateBalances();
		});

		// Event: openSellOrder is successfully called. Updates the state of openSellOrder
		this.state.ibcoCurveViewer.on('OpenSellOrder', async (seller, batchId, collateral, amount, event) => {
			let receipt = await event.getTransactionReceipt();
			let oSell = [
				{
					seller: seller,
					batchId: batchId,
					collateral: collateral,
					amount: amount,
					transactionHash: receipt.transactionHash,
				},
			];
			// console.log("ON OpenSellOrder")
			this.appendOpenSellOrders(oSell);
			await this.updateBalances();
		});

		//  Event: buy order is claimed. Updates balances and nulls openBuyOrder in state
		this.state.ibcoCurveViewer.on('ClaimBuyOrder', async (a, b, c, d, e) => {
			let receipt = await e.getTransactionReceipt();
			// console.log("BUY ORDER CLAIMED");
			// console.log(a, b, c, d);
			let bClaim = [
				{
					type: 'ClaimBuyOrder',
					buyer: a,
					batchId: b,
					collateral: c,
					amount: d,
					transactionHash: receipt.transactionHash,
				},
			];
			// this.removeOpenBuyOrder(bClaim)
			this.prependClaims(bClaim);
			await this.updateBalances();
		});

		// Event: sell order is claimed. Updates balances and nulls openSellOrder in state
		this.state.ibcoCurveViewer.on('ClaimSellOrder', async (a, b, c, d, e, event) => {
			let receipt = await event.getTransactionReceipt();
			// console.log("SELL ORDER CLAIMED");
			// console.log(a, b, c, d, e);
			let sClaim = [
				{
					type: 'ClaimSellOrder',
					seller: a,
					batchId: b,
					collateral: c,
					fee: d,
					value: e,
					transactionHash: receipt.transactionHash,
				},
			];
			// this.removeOpenSellOrder(sClaim)
			this.prependClaims(sClaim);
			await this.updateBalances();
		});
	};
	//
	historicData = async (fromBlock, toBlock) => {
		//
		// HISTORICAL DATA POLLING
		//
		const historicFilter = {
			address: config.apis.curveAddress,
			fromBlock: fromBlock,
			toBlock: toBlock,
			topics: [
				[
					utils.id('OpenBuyOrder(address,uint256,address,uint256,uint256)'),
					utils.id('OpenSellOrder(address,uint256,address,uint256)'),
					utils.id('ClaimBuyOrder(address,uint256,address,uint256)'),
					utils.id('ClaimSellOrder(address,uint256,address,uint256,uint256)'),
				],
				// [
				// 	ethers.utils.keccak256(this.state.address)
				// ]
			],
		};
		const _logs = await this.state.provider.getLogs(historicFilter);

		let openBuys = [];
		let openSells = [];
		const claims = [];
		let y = 0;
		// logging historical data
		// two arrays: one for all OpenBuyOrders of current user, another for all Claim orders for all users
		// checks if a Claim has been submitted by the current user. If so, removes the corresponding OpenBuyOrder from the user's array
		// may cause an error if a user submits multiple open buys in a single block
		// should migrate to TheGraph for more stable interaction with historical data
		for (const _log of _logs) {
			y++;
			// console.log("YYYYY",y);
			try {
				const log = this.state.ibcoCurveViewer.interface.parseLog(_log);
				//console.log("_LOG: ", _log);
				const blockNum = _log.blockNumber;
				const transactionHash = _log['transactionHash'];
				// console.log("blockNum",blockNum)
				// console.log(log.args.batchId._hex);
				// console.log('log.orgs',log.args)
				// if(log.args.buyer !== undefined && log.args.buyer){
				// 	if(log.args.buyer.toLowerCase() === this.state.address.toLowerCase()){
				// 		console.log('me as a buyer', log)
				// 	}
				// }

				// if(log.args.seller !== undefined && log.args.seller){
				// 	if(log.args.seller.toLowerCase() === this.state.address.toLowerCase()){
				// 		console.log('me as a seller', log)
				// 	}
				// }

				switch (log.name) {
					case 'OpenBuyOrder': {
						if (this.state.address.toLowerCase() == log.args.buyer.toLowerCase()) {
							log.transactionHash = transactionHash;
							openBuys.push(log);
						}
						break;
					}
					case 'OpenSellOrder': {
						if (this.state.address.toLowerCase() == log.args.seller.toLowerCase()) {
							log.transactionHash = transactionHash;
							openSells.push(log);
						}
						break;
					}
					case 'ClaimBuyOrder': {
						log.transactionHash = transactionHash;
						claims.push(log);
						break;
					}
					case 'ClaimSellOrder': {
						log.transactionHash = transactionHash;
						claims.push(log);
						break;
					}
					default:
						break;
				}
				// logs.push(log);
			} catch (e) {
				console.error(`unexpected error (likely unexpected event): ${e}`);
				continue;
			}
		}

		// format data for store
		let storeOpenBuys = [];
		for (const _val of openBuys) {
			storeOpenBuys.push({
				buyer: _val.args.buyer,
				batchId: _val.args.batchId,
				collateral: _val.args.collateral,
				fee: _val.args.fee,
				value: _val.args.value,
				transactionHash: _val.transactionHash,
			});
		}
		// console.log("SOB: ", storeOpenBuys);

		let storeOpenSells = [];
		for (const _val of openSells) {
			storeOpenSells.push({
				seller: _val.args.seller,
				batchId: _val.args.batchId,
				collateral: _val.args.collateral,
				amount: _val.args.amount,
				transactionHash: _val.transactionHash,
			});
		}
		// console.log("SOS: ", storeOpenSells);

		let storeClaims = [];
		for (const _val of claims) {
			if (_val.name === 'ClaimBuyOrder') {
				storeClaims.push({
					type: _val.name,
					buyer: _val.args.buyer,
					batchId: _val.args.batchId,
					collateral: _val.args.collateral,
					amount: _val.args.amount,
					transactionHash: _val.transactionHash,
				});
			} else {
				//store sells
				storeClaims.push({
					type: _val.name,
					seller: _val.args.seller,
					batchId: _val.args.batchId,
					collateral: _val.args.collateral,
					fee: _val.args.fee,
					value: _val.args.value,
					transactionHash: _val.transactionHash,
				});
			}
		}
		// console.log('storeOpenBuys',storeOpenBuys)
		// store logged data as store
		this.appendOpenBuyOrders(storeOpenBuys);
		this.appendOpenSellOrders(storeOpenSells);
		this.appendClaims(storeClaims);
	};

	appendOpenBuyOrders(input) {
		// console.log("appendOpenBuyOrders",input)
		let orders = this.state.ibcoOpenBuyOrders.concat(input);
		this.setState({ ibcoOpenBuyOrders: orders });
	}

	appendOpenSellOrders(input) {
		let orders = this.state.ibcoOpenSellOrders.concat(input);
		this.setState({ ibcoOpenSellOrders: orders });
	}

	appendClaims(input) {
		// My Claims Detect
		// console.log('appendClaims', input)
		let myClaims = [];
		let Claims = this.state.ibcoClaims;
		for (const claim of input) {
			if (claim.type === 'ClaimBuyOrder') {
				if (claim.buyer.toLowerCase() === this.state.address.toLowerCase()) {
					myClaims.push(claim);
				}
			} else {
				if (claim.seller.toLowerCase() === this.state.address.toLowerCase()) {
					myClaims.push(claim);
				}
			}
		}
		// var joined = this.state.ibcoClaims.concat(input);
		this.setState({
			ibcoClaims: Claims.concat(input), //.reverse().slice(0, 15),
			ibcoMyClaims: this.state.ibcoMyClaims.concat(myClaims),
		});
	}

	prependClaims(input) {
		// My Claims Detect
		// console.log('appendClaims', input)
		let myClaims = [];
		let Claims = this.state.ibcoClaims;
		for (const claim of input) {
			if (claim.type === 'ClaimBuyOrder') {
				if (claim.buyer.toLowerCase() === this.state.address.toLowerCase()) {
					myClaims.push(claim);
				}
			} else {
				if (claim.seller.toLowerCase() === this.state.address.toLowerCase()) {
					myClaims.push(claim);
				}
			}
		}
		// var joined = this.state.ibcoClaims.concat(input);
		this.setState({
			ibcoClaims: input.concat(Claims), //.reverse().slice(0, 15),
			ibcoMyClaims: myClaims.concat(this.state.ibcoMyClaims),
		});
	}

	setOpenBuyOrders(input) {
		this.setState({ ibcoOpenBuyOrders: input });
	}

	setOpenSellOrders(input) {
		this.setState({ ibcoOpenSellOrders: input });
	}

	setClaims(input) {
		// My Claims Detect
		let myClaims = [];
		for (const claim of input) {
			if (claim.type === 'ClaimBuyOrder') {
				if (claim.buyer.toLowerCase() === this.state.address.toLowerCase()) {
					myClaims.push(claim);
				}
			} else {
				if (claim.seller.toLowerCase() === this.state.address.toLowerCase()) {
					myClaims.push(claim);
				}
			}
		}
		// var joined = this.state.ibcoClaims.concat(input);
		this.setState({
			ibcoClaims: input.reverse().slice(0, 15),
			ibcoMyClaims: myClaims,
		});
	}

	removeOpenSellOrder(input) {
		var newIbcoOpenSellOrder = this.state.ibcoOpenSellOrders.filter((value) => {
			if (this.state.address.toLowerCase() === input[0].seller.toLowerCase() && value.batchId === input[0].batchId) {
				return value;
			}
		});
		this.setState({ ibcoOpenSellOrders: newIbcoOpenSellOrder });
	}

	removeOpenBuyOrder(input) {
		var newIbcoOpenBuyOrder = this.state.ibcoOpenBuyOrders.filter((value) => {
			if (this.state.address.toLowerCase() === input[0].buyer.toLowerCase() && value.batchId === input[0].batchId) {
				return value;
			}
		});
		this.setState({ ibcoOpenBuyOrders: newIbcoOpenBuyOrder });
	}

	setBlock(input) {
		this.setState({ ibcoBlock: input });
	}

	///

	//
	// Transactions helper
	//

	refreshGasPrice = (async) => {
		getGasPrice().then((response) => {
			if (response.data.result === true) {
				if (response.data.landGasCost) {
					this.setState({ gasLandCost: response.data.landGasCost.toFixed(2) });
				}
			}
		});
	};

	keepUpdatedPublicAddress = (async) => {
		setInterval(async () => {
			if (this.context.state.hasLoaded === true) {
				if (this.context.state.user.publicAddress !== undefined && this.state.address !== null) {
					let sign = await this.state.signer.getAddress();
					if (this.context.state.user.publicAddress !== sign.toLowerCase()) {
						removeUser();
						window.location = '/';
					}
				}
			}
		}, 1000);
	};

	keepUpdatedGasPrice = () => {
		this.refreshGasPrice();
		setInterval(() => {
			this.refreshGasPrice();
		}, 30000);
	};

	mintLightMintedLand = async (hexId) => {
		try {
			let approve = await this.state.lightMintingSigner.claim('0x' + hexId);
			// Start recursive check on land market status
			updateLandMarketStatusIfHasBeenMinted(hexId).then((response) => {});
			// Confirm notification
			successNotification(this.props.t('Success.action.title'), this.props.t('Success.request.process.desc'));
		} catch (err) {
			if (err.toString().includes('transaction may fail')) {
				warningNotification(
					this.props.t('Warning.action.already.done.title'),
					this.props.t('Warning.action.already.done.desc'),
				);
			}
		}
	};

	getUSDValueInOvr = (usd = 1) => {
		let floorValue = 0.1;
		let ibcoOVRCurrentPrice;
		if (this.state.ibcoCurrentOvrPrice !== 0.06) {
			ibcoOVRCurrentPrice = 1 / parseFloat(this.state.ibcoCurrentOvrPrice);
		} else {
			ibcoOVRCurrentPrice = this.state.ibcoCurrentOvrPrice;
		}
		// If value OVR token and it's more than 0.1 use it as floor
		if (ibcoOVRCurrentPrice > 0.1) {
			floorValue = ibcoOVRCurrentPrice;
		}
		return (usd / floorValue).toFixed(2);
	};

	authorizeOvrExpense = async (ovr = '100000') => {
		window.ethereum.enable();
		let contractAsAccount = new ethers.Contract(config.apis.OVRContract, ovrAbi, this.state.signer);
		const howMuchTokens = ethers.utils.parseUnits(ovr, 18);
		await contractAsAccount.approve(config.apis.walletApproved, howMuchTokens);
	};

	setRewardBalance = (reward) => {
		this.setState({
			ibcoRewardBalance: reward,
		});
	};
	//
	// Centralized authentication with Metamask
	//

	handleCentralizedLogin(publicAddress, callback) {
		signUpLoginMetamask(publicAddress).then((response) => {
			getUserNonce(publicAddress).then((response) => {
				if (response.data.result === true) {
					let nonce = response.data.user.nonce;
					this.handleUserSignMessage(publicAddress, nonce, callback);
				}
			});
		});
	}

	handleUserSignMessage = async (publicAddress, nonce, callback) => {
		let signature = await this.state.signer.signMessage(`I am signing my one-time nonce: ${nonce}`);
		this.handleAuthenticate(publicAddress, signature, callback);
	};

	handleAuthenticate = (publicAddress, signature, callback) => {
		signIn(publicAddress, signature).then((response) => {
			if (response.data.result === true) {
				// Save data in store
				this.context.actions.loginUser(response.data.token, response.data.user);
				this.setState({ gasLandCost: response.data.gas.landGasCost.toFixed(2) });

				if (callback) {
					callback();
				}
			} else {
				dangerNotification(this.props.t('Danger.unable.login.title'), response.data.errors[0].message);
			}
		});
	};

	render() {
		return (
			<Web3Context.Provider
				value={{
					state: this.state,
					actions: {
						setupWeb3: this.setupWeb3,
						authorizeOvrExpense: this.authorizeOvrExpense,
						getUSDValueInOvr: this.getUSDValueInOvr,
						mintLightMintedLand: this.mintLightMintedLand,
						setRewardBalance: this.setRewardBalance,
						calculateCustomBuyPrice: this.calculateCustomBuyPrice,
						calculateCustomSellPrice: this.calculateCustomSellPrice,
						calculateCustomBuySlippage: this.calculateCustomBuySlippage,
						calculateCustomSellSlippage: this.calculateCustomSellSlippage,
					},
				}}
			>
				{this.props.children}
			</Web3Context.Provider>
		);
	}
}

export function withWeb3Context(Component) {
	class ComponentWithContext extends React.Component {
		render() {
			return (
				<Web3Context.Consumer>
					{(value) => <Component {...this.props} web3Provider={{ ...value }} />}
				</Web3Context.Consumer>
			);
		}
	}

	return ComponentWithContext;
}
