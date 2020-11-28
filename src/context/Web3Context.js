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

const controllerABI = require("../contract/controllerABI");
const curveABI = require("../contract/curveABI");
const DAIABI = require("../contract/DAIABI");
const rewardABI = require("../contract/rewardABI");
const bancorFormulaABI = require("../contract/bancorFormulaABI");


export const Web3Context = createContext();

export class Web3Provider extends Component {
  static contextType = UserContext;
  constructor(props) {
		super(props);
    this.state = {
			setupComplete: false,
			ibcoSetupComplete: false,
			provider: null,
			signer: null,
      address: null,
			ovrsOwned: 0,
			gasLandCost: 0,
      perEth: 0,
      perUsd: 0,
			lastTransaction: "0x0",
			ibcoOpenBuyOrders: [],
			ibcoOpenSellOrders: [],
			ibcoClaims: []
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
			let OVRSupply = await this.state.ibcoRewardViewer.totalSupply();
			this.setState({
				"ibcoOVRSupply": OVRSupply
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
			//check if Reserve is zero. It it's zero, add 1
			let res = this.state.ibcoDAIReserve.toString() === "0"
							? BigNumber.from(1)
							: this.state.ibcoDAIReserve;
			
				
			let price1 = await this.state.ibcoBancorFormulaViewer.calculatePurchaseReturn(
					//supply,balance,weight, amount
					this.state.ibcoOVRSupply,
					res,
					config.apis.connectorWeight,
					BigNumber.from(10 ** 9).mul(BigNumber.from(10 ** 9))
			);

			this.setState({
				"ibcoPrice1": price1
			});


			// console.log("SWITCH LOADING");
			// this.props.store.switchLoading();
			this.setState({
				"ibcoSetupComplete": true
			})
			this.historicData();
			this.ibcoPoll()
	};
	
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
			let price1 = await this.state.ibcoBancorFormulaViewer.calculatePurchaseReturn(
					//supply,balance,weight, amount
					this.state.ibcoOVRSupply,
					res,
					config.apis.connectorWeight,
					BigNumber.from(10 ** 9).mul(BigNumber.from(10 ** 9))
			);

			this.setState({
				"ibcoPrice1": price1
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
							// console.log("APPROVED DAI", owner, spender, amount);
							// Allowance of DAI spendable by curve contract
							let allowance = await this.state.ibcoDAIViewer.allowance(
									this.state.address,
									config.apis.curveAddress
							);
							this.setState({
								"ibcoDAIAllowance": allowance
							});
					}
			);

			// Event: openBuyOrder is successfully called. Updates the state of openBuyOrder
			this.state.ibcoCurveViewer.on(
					"OpenBuyOrder",
					async (buyer, batchId, collateral, fee, value) => {
							let oBuy = [
									{
											buyer: buyer,
											batchId: batchId,
											collateral: collateral,
											fee: fee,
											value: value,
									},
							];
							this.setOpenBuyOrders(oBuy);

							// Allowance of DAI spendable by curve contract
							let allowance = await this.state.ibcoDAIViewer.allowance(
									this.state.address,
									config.apis.curveAddress
							);
							this.setState({
								"ibcoDAIAllowance": allowance
							});
					}
			);

			// Event: openSellOrder is successfully called. Updates the state of openSellOrder
			this.state.ibcoCurveViewer.on(
					"OpenSellOrder",
					async (seller, batchId, collateral, amount) => {
							let oSell = [
									{
											seller: seller,
											batchId: batchId,
											collateral: collateral,
											amount: amount,
									},
							];
							this.setOpenSellOrders(oSell);
					}
			);

			//  Event: buy order is claimed. Updates balances and nulls openBuyOrder in state
			this.state.ibcoCurveViewer.on("ClaimBuyOrder", async (a, b, c, d) => {
					// console.log("BUY ORDER CLAIMED");
					// console.log(a, b, c, d);
					let bClaim = [
							{
									type: "ClaimBuyOrder",
									buyer: a,
									batchId: b,
									collateral: c,
									amount: d,
							},
					];
					this.setClaims(bClaim);
					await this.updateBalances();
			});

			// Event: sell order is claimed. Updates balances and nulls openSellOrder in state
			this.state.ibcoCurveViewer.on(
					"ClaimSellOrder",
					async (a, b, c, d, e) => {
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
									},
							];
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
						console.log("LOG: ", log);
						// console.log("_LOG: ", _log);
						const blockNum = _log.blockNumber;
						// console.log(log.args.batchId._hex);
						// console.log(blockNum);
						console.log(log.name);
						switch (log.name) {
								case "OpenBuyOrder": {
										if (
												this.state.address.toLowerCase() ==
												log.args.buyer.toLowerCase()
										) {
												openBuys.push(log);
										}
										break;
								}
								case "OpenSellOrder": {
										if (
												this.state.address.toLowerCase() ==
												_logs.args.seller.toLowerCase()
										) {
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
																console.log("MATCH", value.args.batchId._hex);
														}
												});
												openBuys = filterBuy;
										}
										claims.push(log);
										break;
								}
								case "ClaimSellOrder": {
										if (
												this.state.address.toLowerCase() ==
												log.args.seller.toLowerCase()
										) {
												var filterSell = openSells.filter(function (
														value,
														index,
														arr
												) {
														if (value.args.batchId._hex !== log.args.batchId._hex) {
																return value;
														} else {
																console.log("MATCH", value.args.batchId._hex);
														}
												});
												openSells = filterSell;
										}
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
						});
				}
		}

		// store logged data as store
		this.setOpenBuyOrders(storeOpenBuys);
		this.setOpenSellOrders(storeOpenSells);
		this.setClaims(storeClaims);
	};

	setOpenBuyOrders(input) {
		var joined = this.state.ibcoOpenBuyOrders.concat(input);
		this.setState({ ibcoOpenBuyOrders: joined })
	}

	setOpenSellOrders(input) {
		var joined = this.state.ibcoOpenSellOrders.concat(input);
		this.setState({ ibcoOpenSellOrders: joined })
	}

	setClaims(input) {
		var joined = this.state.ibcoClaims.concat(input);
		this.setState({ ibcoClaims: joined })
	}

	setBlock(input) {
		this.setState({ ibcoBlock: input })
	}
	
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
		// TODO get value of OVR token and if it's more than 0.1 use it as floor
		return (usd / floorValue).toFixed(2);
	}

	authorizeOvrExpense = async ( ovr = "10000" ) => {
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
						setRewardBalance: this.setRewardBalance
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
