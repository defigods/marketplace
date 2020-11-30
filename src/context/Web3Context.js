import React, { createContext, Component } from 'react';
import { removeToken, saveToken, isLogged, getToken, removeUser, getPublicAddress} from '../lib/auth';
import { successNotification, networkError, dangerNotification, warningNotification } from '../lib/notifications';
import { userProfile, getUserNonce, signUpPublicAddress, signIn, sendPreAuctionStart, sendConfirmAuctionStart, sendPreAuctionBid, signUpLoginMetamask, getGasPrice } from '../lib/api';
import {promisify} from '../lib/config';
import config from '../lib/config';
import { promisifyAll } from 'bluebird';
import { ethers, BigNumber,utils } from 'ethers';
import { UserContext } from './UserContext';
import { useHistory } from 'react-router-dom';
import {abi} from '../contract/abi';
import ovrAbi from '../contract/ovrAbi';
import bn from "bignumber.js";

const controllerABI = require("../contract/controllerABI");
const curveABI = require("../contract/curveABI");
const DAIABI = require("../contract/DAIABI");
const rewardABI = require("../contract/rewardABI");
const bancorFormulaABI = require("../contract/bancorFormulaABI");
const premine = BigNumber.from(81688155);
const initialVirtualBalance = BigNumber.from(371681).mul(
		BigNumber.from(10 ** 9).mul(BigNumber.from(10 ** 9))
);
const mantissa = new bn(1e18);


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
			lastTransaction: "0x0",
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
      this.setupWeb3((res) =>{
        if( res == false ){
          this.context.actions.logoutUser();
        } 
      }, false)
		}
  }

  setupWeb3 = async (callback, login=true) => {
		if (typeof web3 !== "undefined") {
			await window.ethereum.enable();
			let provider = new ethers.providers.Web3Provider(window.ethereum);
			let network = await provider.getNetwork();
			let chainId = network.chainId;
			let signer = provider.getSigner(0);
			let address = await signer.getAddress();
			
			if (address == undefined) {
				// Metamask found, but not logged in
				callback(false)
			} else {
				// Metamask found, logged in, check chainId
				let web3NetworkVersion = parseInt(chainId) === config.web3network;
				if( web3NetworkVersion === false ) {
					// Wrong Network
          warningNotification(this.props.t('Warning.metamask.wrong.network.title'), this.props.t('Warning.metamask.wrong.network.desc'));
					callback(false);
					return false;
				}

				// Metamask found, logged in, chainId correct
				
				let block = await provider.getBlock();
				await this.setState({"ibcoBlock": BigNumber.from(block.number)})
				
				this.setState({
					"provider": provider,
					"signer": signer,
					"address": address,
					"chainId": chainId,
					"setupComplete": true,
				});

				// Intialize contracts 
				let data = await this.initializeContracts();
				await this.setSigners(
						data[0],
						data[1],
						data[2],
						data[3],
						data[4],
						data[5],
						data[6],
						data[7]
				);
				
        // Centralized Login
        if(login == true){
          await this.handleCentralizedLogin(address, callback)
				}
				this.keepUpdatedGasPrice()
				this.keepUpdatedPublicAddress()
			}
		} else {
			// Metamask not detected
			warningNotification(this.props.t('Warning.metamask.not.detected.title'), this.props.t('Warning.metamask.not.detected.desc'));
			callback(false);
			return false;
		}
	};
	
	// 
	// IBCO
	//

	setSigners = async (x, y, z, a, b, c, d, e) => {
			this.setState({
				"ibcoController": x,
				"ibcoControllerViewer": y,
				"ibcoCurveViewer": z,
				"ibcoDAISigner": a,
				"ibcoDAIViewer": b,
				"ibcoRewardSigner": c,
				"ibcoRewardViewer": d,
				"ibcoBancorFormulaViewer": e,
			});
			this.initializeStore();
	};

	initializeStore = async () => {
			// contract data storage initialization
			// current Batch ID
			let batchId = await this.state.ibcoCurveViewer.getCurrentBatchId();
			this.setState({
				"ibcoBatchId": batchId
			});

			// DAI collateral
			let DAI = await this.state.ibcoCurveViewer.getCollateralToken(
					config.apis.DAI
			);
			this.setState({
					"ibcoCollateralDAI": {
					"whitelisted": DAI[0],
					"virtualSupply": DAI[1],
					"virtualBalance": DAI[2],
					"reserveRatio": DAI[3],
					"slippage": DAI[4],
				},
			});
			
			// Reward token balance
			let reward = await this.state.ibcoRewardViewer.balanceOf(
					this.state.address
			);
			this.setState({
				"ibcoRewardBalance": reward
			});
			// console.log('parseFloat(ethers.utils.formatEther(reward).toString())',parseFloat(ethers.utils.formatEther(reward).toString()))
			this.context.actions.setUserBalance(parseFloat(ethers.utils.formatEther(reward).toString()))

			// DAI balance of user
			let balance = await this.state.ibcoDAIViewer.balanceOf(
					this.state.address
			);
			this.setState({
				"ibcoDAIBalance": balance
			});

			// DAI balance of bonding curve
			let reserve = await this.state.ibcoDAIViewer.balanceOf(
					config.apis.curveAddress
			);
			this.setState({
				"ibcoDAIReserve": reserve
			});

			// Total supply of OVR Token
			let TotalOVRSupply = await this.state.ibcoRewardViewer.totalSupply();
			let CurveOVRSupply = TotalOVRSupply.sub(
							premine.mul(
									BigNumber.from(10 ** 9).mul(BigNumber.from(10 ** 9))
							)
					)

			let doublePremine = premine.mul(BigNumber.from(2)).mul(BigNumber.from(10 ** 9).mul(BigNumber.from(10 ** 9)))			
			let vsBancorFormula = doublePremine.add(CurveOVRSupply)

			this.setState({
				"ibcoOVRSupply": CurveOVRSupply,
				"ibcoTotalOVRSupply": TotalOVRSupply,
				"ibcoDoublePremine": doublePremine,
				"ibcoVsBancorFormula": vsBancorFormula
			});

			// Allowance of DAI spendable by curve contract
			let allowance = await this.state.ibcoDAIViewer.allowance(
					this.state.address,
					config.apis.curveAddress
			);
			this.setState({
				"ibcoDAIAllowance": allowance
			});

			// price of next Token
			let res = this.state.ibcoDAIReserve.toString() === "0"
							? BigNumber.from(1)
							: this.state.ibcoDAIReserve;
						
			let virtualResBancorFormula = res.add(initialVirtualBalance);
			this.setState({
				"ibcoVirtualResBancorFormula": virtualResBancorFormula,
			});

			let price1 = await this.state.ibcoBancorFormulaViewer.calculatePurchaseReturn(
					vsBancorFormula,
					virtualResBancorFormula,
					config.apis.connectorWeight,
					BigNumber.from(10 ** 9).mul(BigNumber.from(10 ** 9))
			);
			this.setState({
				"ibcoPrice1": price1
			});
			
			// priceOVR
			let priceOvr = parseFloat(ethers.utils.formatEther(price1).toString()).toFixed(3)
			this.setState({
				"ibcoCurrentOvrPrice": priceOvr
			})

			// Start setting up History and Poll
 			this.historicData();
			this.ibcoPoll()
			
			// Swich setup to complete
			this.setState({
				"ibcoSetupComplete": true
			})
	};
	
	// Calculate adapted price
	calculateCustomBuyPrice = async (val) => {
		let amountInput =
				val.toString() === "0"
						? mantissa.toFixed(0)
						: new bn(val).times(mantissa).toFixed(0);

		let newPrice = await this.state.ibcoBancorFormulaViewer.calculatePurchaseReturn(
				this.state.ibcoVsBancorFormula,
				this.state.ibcoVirtualResBancorFormula,
				config.apis.connectorWeight,
				amountInput
		);
		return parseFloat(ethers.utils.formatEther(newPrice).toString()).toFixed(3)
	}

	calculateCustomSellPrice = async (val) => {
		let amountInput =
				val.toString() === "0"
						? mantissa.toFixed(0)
						: new bn(val).times(mantissa).toFixed(0);

		let newPrice = await this.state.ibcoBancorFormulaViewer.calculateSaleReturn(
				this.state.ibcoVsBancorFormula,
				this.state.ibcoVirtualResBancorFormula,
				config.apis.connectorWeight,
				amountInput
		);
		return parseFloat(ethers.utils.formatEther(newPrice).toString()).toFixed(3)
	}

	calculateCustomSellSlippage = async (val) => {
		let amountInput =
				val.toString() === "0"
						? mantissa.toFixed(0)
						: new bn(val).times(mantissa).toFixed(0);

		let newPrice = await this.state.ibcoBancorFormulaViewer.calculateSaleReturn(
				this.state.ibcoVsBancorFormula,
				this.state.ibcoVirtualResBancorFormula,
				config.apis.connectorWeight,
				amountInput
		);
		let pricePerToken = (parseFloat(ethers.utils.formatEther(newPrice).toString())) / val
		// console.log('pricePerToken STIMATO', pricePerToken)
		// console.log('pricePerToken CURRENT', (1/this.state.ibcoCurrentOvrPrice))
		let slippage = ((((parseFloat((1/this.state.ibcoCurrentOvrPrice))-(pricePerToken))) / (parseFloat((1/this.state.ibcoCurrentOvrPrice)))) *100)
		// console.log('slippage', slippage)
		return slippage
	}

	calculateCustomBuySlippage = async (val) => {
		let amountInput =
				val.toString() === "0"
						? mantissa.toFixed(0)
						: new bn(val).times(mantissa).toFixed(0);

		let newPrice = await this.state.ibcoBancorFormulaViewer.calculatePurchaseReturn(
				this.state.ibcoVsBancorFormula,
				this.state.ibcoVirtualResBancorFormula,
				config.apis.connectorWeight,
				amountInput
		);
		let pricePerToken = (parseFloat(ethers.utils.formatEther(newPrice).toString()).toFixed(3)) / val

		// console.log('pricePerToken STIMATO', pricePerToken)
		// console.log('pricePerToken CURRENT', (this.state.ibcoCurrentOvrPrice))
		let slippage = ((((parseFloat(this.state.ibcoCurrentOvrPrice)-(pricePerToken))) / (parseFloat(this.state.ibcoCurrentOvrPrice))) *100)
		// console.log('slippage', slippage)
		return slippage
	}

	// initialize all contracts as signer and viewer objects, which allow functions to be called from the blockchain
	// signers call functions which mutate chain state and cost gas
	// viewers call public view functions to retreive data without costing gas
	initializeContracts = async () => {			
			let controllerSigner = new ethers.Contract(
					config.apis.controllerAddress,
					controllerABI,
					this.state.signer
			);
			let controllerViewer = new ethers.Contract(
					config.apis.controllerAddress,
					controllerABI,
					this.state.provider
			);
			let curveViewer = new ethers.Contract(
					config.apis.curveAddress,
					curveABI,
					this.state.provider
			);
			let DAISigner = new ethers.Contract(
					config.apis.DAI,
					DAIABI,
					this.state.signer
			);
			let DAIViewer = new ethers.Contract(
					config.apis.DAI,
					DAIABI,
					this.state.provider
			);
			let rewardSigner = new ethers.Contract(
					config.apis.RewardToken,
					rewardABI,
					this.state.signer
			);
			let rewardViewer = new ethers.Contract(
					config.apis.RewardToken,
					rewardABI,
					this.state.provider
			);
			let bancorViewer = new ethers.Contract(
					config.apis.BancorFormula,
					bancorFormulaABI,
					this.state.provider
			);
			let data = [
					controllerSigner,
					controllerViewer,
					curveViewer,
					DAISigner,
					DAIViewer,
					rewardSigner,
					rewardViewer,
					bancorViewer,
			];
			return data;
	};

	updateBalances = async () => {
			// current DAI balance user
			let balance = await this.state.ibcoDAIViewer.balanceOf(
					this.state.address
			);
			this.setState({
				"ibcoDAIBalance": balance
			});

			// current OVR Balance user
			let reward = await this.state.ibcoRewardViewer.balanceOf(
					this.state.address
			);
			this.setState({
				"ibcoRewardBalance": reward
			});
			// console.log('parseFloat(ethers.utils.formatEther(reward).toString())',parseFloat(ethers.utils.formatEther(reward).toString()))
			this.context.actions.setUserBalance(parseFloat(ethers.utils.formatEther(reward).toString()))

			// current DAI balance reserve
			let reserve = await this.state.ibcoDAIViewer.balanceOf(
					config.apis.curveAddress
			);
			this.setState({
				"ibcoDAIReserve": reserve
			});

			// price of next Token
			//check if Reserve is zero. It it's zero, add 1
			let res = this.state.ibcoDAIReserve.toString() === "0"
							? BigNumber.from(1)
							: this.state.ibcoDAIReserve;
			let virtualResBancorFormula = res.add(initialVirtualBalance);

			let price1 = await this.state.ibcoBancorFormulaViewer.calculatePurchaseReturn(
					//supply,balance,weight, amount
					this.state.ibcoVsBancorFormula,
					virtualResBancorFormula,
					config.apis.connectorWeight,
					BigNumber.from(10 ** 9).mul(BigNumber.from(10 ** 9))
			);
			this.setState({
				"ibcoPrice1": price1
			});

			// priceOVR
			let priceOvr = parseFloat(ethers.utils.formatEther(price1).toString()).toFixed(3)
			this.setState({
				"ibcoCurrentOvrPrice": priceOvr
			})

			// Allowance of DAI spendable by curve contract
			let allowance = await this.state.ibcoDAIViewer.allowance(
					this.state.address,
					config.apis.curveAddress
			);
			this.setState({
				"ibcoDAIAllowance": allowance
			});
	};

	ibcoPoll = async () => {
			const openBuyOrderFilter = {
					address: config.apis.curveAddress,
					topics: [
							[
									utils.id("OpenBuyOrder(address,uint256,address,uint256,uint256"),
									utils.id("OpenSellOrder(address,uint256,address,uint256)"),
									utils.id("ClaimBuyOrder(address,uint256,address,uint256)"),
									utils.id("ClaimSellOrder(address,uint256,address,uint256"),
							],
					],
			};

			this.state.provider.on(openBuyOrderFilter, (log) => {
					// console.log("FILTER FIRE: ", log);
			});

			// this function contains all of the event listeners

			// Event: new block is mined - fetches the most current batchId
			this.state.provider.on("block", async (block) => {
					this.setState({
						"ibcoBlock": block
					});
					let batchId = await this.state.ibcoCurveViewer.getCurrentBatchId();
					this.setState({
						"ibcoBatchId": batchId
					});
			});

			// Event: new batch is created after calling an order. Does not fire on every new batch, only on order function calls.
			this.state.ibcoCurveViewer.on("NewBatch", async (batch) => {
					// console.log("NEW BATCH: ", batch);
			});

			// Event: DAI is approved from transfer
			// console.log("FILL DAI VIEWER: ", this.state.ibcoDAIViewer);
			this.state.ibcoDAIViewer.on(
					"Approval",
					async (owner, spender, amount) => {
							await this.updateBalances();
					}
			);

			// Event: openBuyOrder is successfully called. Updates the state of openBuyOrder
			this.state.ibcoCurveViewer.on(
					"OpenBuyOrder",
					async (buyer, batchId, collateral, fee, value, event) => {
							let receipt = await event.getTransactionReceipt();
							// transactionHash
							let oBuy = [
									{
										buyer: buyer,
										batchId: batchId,
										collateral: collateral,
										fee: fee,
										value: value,
										transactionHash: receipt.transactionHash
									},
							];
							this.setOpenBuyOrders(oBuy);
							await this.updateBalances();
					}
			);

			// Event: openSellOrder is successfully called. Updates the state of openSellOrder
			this.state.ibcoCurveViewer.on(
					"OpenSellOrder",
					async (seller, batchId, collateral, amount, event) => {
							let receipt = await event.getTransactionReceipt();
							let oSell = [
									{
											seller: seller,
											batchId: batchId,
											collateral: collateral,
											amount: amount,
											transactionHash: receipt.transactionHash
									},
							];
							// console.log("ON OpenSellOrder")
							this.setOpenSellOrders(oSell);
							await this.updateBalances();
					}
			);

			//  Event: buy order is claimed. Updates balances and nulls openBuyOrder in state
			this.state.ibcoCurveViewer.on("ClaimBuyOrder", async (a, b, c, d, e) => {
					let receipt = await e.getTransactionReceipt();
					// console.log("BUY ORDER CLAIMED");
					// console.log(a, b, c, d);
					let bClaim = [
							{
									type: "ClaimBuyOrder",
									buyer: a,
									batchId: b,
									collateral: c,
									amount: d,
									transactionHash: receipt.transactionHash
							},
					];
					// this.removeOpenBuyOrder(bClaim)
					this.setClaims(bClaim);
					await this.updateBalances();
			});

			// Event: sell order is claimed. Updates balances and nulls openSellOrder in state
			this.state.ibcoCurveViewer.on(
					"ClaimSellOrder",
					async (a, b, c, d, e, event) => {
							let receipt = await event.getTransactionReceipt();
							// console.log("SELL ORDER CLAIMED");
							// console.log(a, b, c, d, e);
							let sClaim = [
									{
											type: "ClaimSellOrder",
											seller: a,
											batchId: b,
											collateral: c,
											fee: d,
											value: e,
											transactionHash: receipt.transactionHash
									},
							];
							// this.removeOpenSellOrder(sClaim)
							this.setClaims(sClaim);
							await this.updateBalances();
					}
			);
	};

	historicData = async () => {
		//
		// HISTORICAL DATA POLLING
		//
		const historicFilter = {
				address: config.apis.curveAddress,
				fromBlock: this.state.ibcoBlock.sub(9800).toNumber(),
				toBlock: this.state.ibcoBlock.toNumber(),
				topics: [
						[
								utils.id("OpenBuyOrder(address,uint256,address,uint256,uint256)"),
								utils.id("OpenSellOrder(address,uint256,address,uint256)"),
								utils.id("ClaimBuyOrder(address,uint256,address,uint256)"),
								utils.id(
										"ClaimSellOrder(address,uint256,address,uint256,uint256)"
								),
						],
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
				// console.log(y);
				try {
						const log = this.state.ibcoCurveViewer.interface.parseLog(_log);
						// console.log("_LOG: ", _log);
						const blockNum = _log.blockNumber;
						const transactionHash = _log['transactionHash'];
						// console.log(log.args.batchId._hex);
						switch (log.name) {
								case "OpenBuyOrder": {
										if (
												this.state.address.toLowerCase() ==
												log.args.buyer.toLowerCase()
										) {	
												log.transactionHash = transactionHash;
												// console.log("OPENBuys", openBuys)
												openBuys.push(log);
										}
										break;
								}
								case "OpenSellOrder": {
										if (
												this.state.address.toLowerCase() ==
												log.args.seller.toLowerCase()
										) {
												log.transactionHash = transactionHash;
												// console.log("OPENSells", openBuys)
												openSells.push(log);
										}
										break;
								}
								case "ClaimBuyOrder": {
										if (
												this.state.address.toLowerCase() ==
												log.args.buyer.toLowerCase()
										) {
												var filterBuy = openBuys.filter(function (value, index, arr) {
														if (value.args.batchId._hex !== log.args.batchId._hex) {
																return value;
														} else {
																// console.log("MATCH", value.args.batchId._hex);
														}
												});
												openBuys = filterBuy;
										}
										const txInfo = await this.state.provider.getTransaction(transactionHash)
										log.transactionHash = transactionHash;
										claims.push(log);
										break;
								}
								case "ClaimSellOrder": {
										if (
												this.state.address.toLowerCase() ==
												log.args.seller.toLowerCase()
										) {
												const txInfo = await this.state.provider.getTransaction(transactionHash)
												var filterSell = openSells.filter(function (
														value,
														index,
														arr
												) {
														if (value.args.batchId._hex !== log.args.batchId._hex) {
																return value;
														} else {
																// console.log("MATCH", value.args.batchId._hex);
														}
												});
												openSells = filterSell;
										}
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
				if (_val.name === "ClaimBuyOrder") {
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

		// store logged data as store
		this.setOpenBuyOrders(storeOpenBuys);
		this.setOpenSellOrders(storeOpenSells);
		this.setClaims(storeClaims);
		this.setState({
			ibcoLoadedHistory: true
		})
	};

	setOpenBuyOrders(input) {
		this.setState({ ibcoOpenBuyOrders: input.reverse() })
	}

	setOpenSellOrders(input) {
		this.setState({ ibcoOpenSellOrders: input.reverse() })
	}

	setClaims(input) {
		// My Claims Detect
		let myClaims = []
		for (const claim of input) {
			if (claim.type === "ClaimBuyOrder") {
				if(claim.buyer.toLowerCase() === this.state.address.toLowerCase()){ 
					myClaims.push(claim) 
				}
			} else {
				if(claim.seller.toLowerCase() === this.state.address.toLowerCase()){ 
					myClaims.push(claim) 
				}
			}
		}
		// var joined = this.state.ibcoClaims.concat(input);
		this.setState({ 
			ibcoClaims: input.reverse().slice(0, 15),
			ibcoMyClaims: myClaims
		})
	}

	removeOpenSellOrder(input) {
		var newIbcoOpenSellOrder = this.state.ibcoOpenSellOrders.filter((value) => {
			if (this.state.address.toLowerCase() === input[0].seller.toLowerCase() && value.batchId === input[0].batchId) {
				return value;
			} 
		});
		this.setState({ ibcoOpenSellOrders: newIbcoOpenSellOrder })
	}

	removeOpenBuyOrder(input) {
		var newIbcoOpenBuyOrder = this.state.ibcoOpenBuyOrders.filter((value) => {
			if (this.state.address.toLowerCase() === input[0].buyer.toLowerCase() && value.batchId === input[0].batchId) {
				return value;
			} 
		});
		this.setState({ ibcoOpenBuyOrders: newIbcoOpenBuyOrder })
	}


	setBlock(input) {
		this.setState({ ibcoBlock: input })
	}

	///
	
	//
	// Transactions helper
	//

	refreshGasPrice = async => {
		getGasPrice().then((response) => {
				if (response.data.result === true) {
					if(response.data.landGasCost){
					this.setState({gasLandCost: (response.data.landGasCost).toFixed(2)})
				}
				} 
		});
	}

	keepUpdatedPublicAddress = async => {
		setInterval(async () => {
			if(this.context.state.hasLoaded === true){
				if( this.context.state.user.publicAddress !== undefined && this.state.address !== null){
					let sign = await this.state.signer.getAddress()
					if(this.context.state.user.publicAddress !== sign.toLowerCase()){
						removeUser()
						window.location = "/"
					}
				}
			}
		}, 1000)
	}

	keepUpdatedGasPrice = () => {
		this.refreshGasPrice();
		setInterval(() => {
			this.refreshGasPrice();
		}, 30000)
	}

	getUSDValueInOvr = (usd = 1) => {
		let floorValue = 0.1;
		let ibcoOVRCurrentPrice;
		if(this.state.ibcoCurrentOvrPrice !== 0.06){
			ibcoOVRCurrentPrice = 1/(parseFloat(this.state.ibcoCurrentOvrPrice))
		} else {
			ibcoOVRCurrentPrice = this.state.ibcoCurrentOvrPrice
		}
		// If value OVR token and it's more than 0.1 use it as floor
		if(ibcoOVRCurrentPrice > 0.1){
			floorValue = ibcoOVRCurrentPrice;
		}
		return (usd / floorValue).toFixed(2);
	}

	authorizeOvrExpense = async ( ovr = "100000" ) => {
		window.ethereum.enable() 
		let contractAsAccount = new ethers.Contract(config.apis.OVRContract, ovrAbi, this.state.signer)
		const howMuchTokens = ethers.utils.parseUnits(ovr, 18)
		await contractAsAccount.approve(config.apis.walletApproved, howMuchTokens)
	}
	
	setRewardBalance = (reward) => {
		this.setState({
			"ibcoRewardBalance": reward
		});
	}
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
		let signature = await this.state.signer.signMessage(`I am signing my one-time nonce: ${nonce}`)
		this.handleAuthenticate(publicAddress, signature, callback);
  };

  handleAuthenticate = (publicAddress, signature, callback) => {
    signIn(publicAddress, signature).then((response) => {
      if (response.data.result === true) {
				// Save data in store
				this.context.actions.loginUser(response.data.token, response.data.user);
				this.setState({gasLandCost: (response.data.gas.landGasCost).toFixed(2)})
				
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
						setRewardBalance: this.setRewardBalance,
						calculateCustomBuyPrice: this.calculateCustomBuyPrice,
						calculateCustomSellPrice: this.calculateCustomSellPrice,
						calculateCustomBuySlippage: this.calculateCustomBuySlippage,
						calculateCustomSellSlippage: this.calculateCustomSellSlippage
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
