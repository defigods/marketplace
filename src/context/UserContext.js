import React, { createContext, Component } from 'react';
import Web3 from 'web3';
import { removeToken, saveToken, isLogged, getToken, removeUser } from '../lib/auth';
import { successNotification, networkError, dangerNotification, warningNotification } from '../lib/notifications';
import { userProfile, getUserNonce, signUpPublicAddress, signIn } from '../lib/api';
import config from '../lib/config';
import { promisifyAll } from 'bluebird';
import {
	tokenBuyAddress,
	daiAddress,
	tetherAddress,
	usdcAddress,
	ovrAddress,
	icoAddress,
	ovr721Address,
} from '../lib/contracts';
import { tokenBuyAbi, erc20Abi, icoAbi, ovr721Abi } from '../lib/abis';
import { zhCN } from 'date-fns/esm/locale';

let ActionCable = require('actioncable');

// TODO Change this to the final address
const FIAT_BUY_URL = 'http://staging-credit-card.ovr.ai/buy';

const promisify = (inner) =>
	new Promise((resolve, reject) =>
		inner((err, res) => {
			if (err) {
				reject(err);
			} else {
				resolve(res);
			}
		}),
	);

export const UserContext = createContext();

export class UserProvider extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoggedIn: false,
			showNotificationCenter: false,
			token: null,
			user: {
				uuid: null,
			},
			ovrsOwned: 0,
			dai: null,
			tether: null,
			usdc: null,
			tokenBuy: null,
			ovr: null,
			ico: null,
			ovr721: null,
			setupComplete: false,
			perEth: 0,
			perUsd: 0,
		};
	}

	componentDidMount() {
		if (isLogged()) {
			this.lightSetupWeb3();

			userProfile()
				.then((response) => {
					if (response.data.result === true) {
						this.setState({ user: response.data.user });
						this.liveSocket();
					} else {
						dangerNotification('Session expired', 'Please login again');
						this.logOutUser();
					}
				})
				.catch(() => {
					// Notify user if network error
					networkError();
				});

			this.loginUser(getToken('userToken'), getToken('userUuid'));
		}
	}

	loginUser = (token, user) => {
		this.setState({ isLoggedIn: true, token: token, user: user });
		// Cookie management
		saveToken('userToken', token);
		saveToken('userUuid', user);
		this.liveSocket();
	};

	logOutUser = () => {
		this.setState({ isLoggedIn: false, token: null, user: { uuid: null } });

		// Cookie management
		removeToken('userToken');
		removeToken('userUuid');
	};

	waitTx = (txHash) => {
		return new Promise((resolve, reject) => {
			let blockCounter = 60; // If it's not confirmed after 30 blocks, move on
			// Wait for tx to be finished
			let filter = window.web3.eth.filter('latest').watch(async (err, blockHash) => {
				if (err) {
					filter.stopWatching();
					filter = null;
					return reject(err);
				}
				if (blockCounter <= 0) {
					filter.stopWatching();
					filter = null;
					console.warn('!! Tx expired !!');
					reject(`Transaction not confirmed after ${blockCounter} blocks`);
				}
				// Get info about latest Ethereum block
				const block = await promisify((cb) => window.web3.eth.getBlock(blockHash, cb));
				--blockCounter;
				// Found tx hash?
				if (block.transactions.indexOf(txHash) > -1) {
					// Tx is finished
					filter.stopWatching();
					filter = null;
					return resolve();
					// Tx hash not found yet?
				}
			});
		});
	};

	// Note: the web3 version is always 0.20.7 because of metamask
	setupWeb3 = async (callback) => {
		console.log('render setupweb3');
		const ethereum = window.ethereum;
		if (typeof ethereum !== 'undefined') {
			try {
				await ethereum.enable();
			} catch (e) {
				return warningNotification('Metamask permission error', 'You must accept the connection request to continue');
			}
			window.web3 = new Web3(ethereum);
		} else if (typeof window.web3 !== 'undefined') {
			window.web3 = new Web3(window.web3.currentProvider);
		} else {
			return warningNotification('Metamask not detected', 'You must login to metamask to use this application');
		}
		window.web3.eth.defaultAccount = window.web3.eth.accounts[0];

		// Sign nonce for centralized login
		let publicAddress = window.web3.eth.defaultAccount.toLowerCase();
		await this.handleCentralizedLogin(publicAddress, callback);

		// Helpers
		await this.refreshWhenAccountsChanged();
		await this.updateBalanceWhenChanged();

		await this.setupContracts();
		await this.getOvrsOwned();
	};

	// if the user is logged in with a valid token just reload datas
	lightSetupWeb3 = async () => {
		window.web3.eth.defaultAccount = window.web3.eth.accounts[0];
		await this.refreshWhenAccountsChanged();
		await this.updateBalanceWhenChanged();
		await this.setupContracts();
		await this.getOvrsOwned();
	};

	setupContracts = async () => {
		const _dai = window.web3.eth.contract(erc20Abi).at(daiAddress);
		const _tether = window.web3.eth.contract(erc20Abi).at(tetherAddress);
		const _usdc = window.web3.eth.contract(erc20Abi).at(usdcAddress);
		const _tokenBuy = window.web3.eth.contract(tokenBuyAbi).at(tokenBuyAddress);
		const _ovr = window.web3.eth.contract(erc20Abi).at(ovrAddress);
		const _ico = window.web3.eth.contract(icoAbi).at(icoAddress);
		const _ovr721 = window.web3.eth.contract(ovr721Abi).at(ovr721Address);
		this.setState({
			dai: promisifyAll(_dai),
			tether: promisifyAll(_tether),
			usdc: promisifyAll(_usdc),
			tokenBuy: promisifyAll(_tokenBuy),
			ovr: promisifyAll(_ovr),
			ico: promisifyAll(_ico),
			ovr721: promisifyAll(_ovr721),
			setupComplete: true,
		});
	};

	// Refreshes the page when the metamask account is changed
	refreshWhenAccountsChanged = () => {
		console.log('init refresh');
		window.ethereum.on('accountsChanged', (accounts) => {
			console.log('this.state.isLoggedIn', this.state.isLoggedIn);
			if (this.state.isLoggedIn) {
				console.log('isLoggedin');
				this.logOutUser();
				this.setupWeb3();
			} else {
				//
			}
		});
	};

	// Checks every second if the balance has changed and updates it
	updateBalanceWhenChanged = async () => {
		setInterval(() => this.getOvrsOwned(), 1e3);
	};

	getOvrsOwned = async () => {
		if (this.state.ovr && this.state.setupComplete && window.web3.eth.defaultAccount) {
			const ovrsOwned = String(
				window.web3.fromWei(await this.state.ovr.balanceOfAsync(window.web3.eth.defaultAccount)),
			);
			this.setState({ ovrsOwned });
		}
	};

	//
	// Centralized authentication with Metamask
	//

	handleCentralizedLogin(publicAddress, callback) {
		getUserNonce(publicAddress).then((response) => {
			if (response.data.result === true) {
				let nonce = response.data.user.nonce;
				this.handleUserSignMessage(publicAddress, nonce, callback);
			} else {
				dangerNotification('Unable to login', response.data.errors);
			}
		});
	}

	handleUserSignMessage = (publicAddress, nonce, callback) => {
		return new Promise((resolve, reject) =>
			window.web3.personal.sign(
				window.web3.fromUtf8(`I am signing my one-time nonce: ${nonce}`),
				publicAddress,
				(err, signature) => {
					if (err) return reject(err);
					this.handleAuthenticate(publicAddress, signature, callback);
				},
			),
		);
	};

	handleAuthenticate = (publicAddress, signature, callback) => {
		signIn(publicAddress, signature).then((response) => {
			if (response.data.result === true) {
				// Save data in store
				this.loginUser(response.data.token, response.data.user);
				if (callback) {
					callback();
				}
			} else {
				dangerNotification('Unable to login', response.data.errors[0].message);
			}
		});
	};

	// Web3 Lands

	redeemLands = async () => {
		const activeLandsIds = await this.state.ico.getActiveLandsAsync();
		let landsRedeemed = 0;
		for (let i = 0; i < activeLandsIds.length; i++) {
			const land = await this.state.ico.landsAsync(activeLandsIds[i]);
			const auctionTime = await this.state.ico.auctionLandDurationAsync();
			const now = Math.trunc(Date.now() / 1000);
			const timePassedInSeconds = now - land[3];
			const landState = parseInt(land[4]);

			// If this is your land and it hasn't been redeemed already and the auction is done
			if (landState !== 2 && land[0] === window.web3.eth.defaultAccount && timePassedInSeconds >= auctionTime) {
				try {
					await this.state.ico.redeemWonLandAsync(activeLandsIds[i], {
						gasPrice: window.web3.toWei(30, 'gwei'),
					});
					landsRedeemed++;
				} catch (e) {
					return dangerNotification(`Error redeeming the land ${activeLandsIds[i]}`, e.message);
				}
			}
		}
		if (landsRedeemed === 0) {
			warningNotification(
				'No lands to redeem',
				"You don't have any lands to redeem for now. Check in a few hours when the auction time is reached.",
			);
		} else {
			successNotification('Your lands are on their way!', "You'll receive your lands in a few minutes");
		}
	};

	redeemSingleLand = async (hexId) => {
		const landId = parseInt(hexId, 16);
		try {
			const tx = await this.state.ico.redeemWonLandAsync(landId, {
				gasPrice: window.web3.toWei(30, 'gwei'),
			});
			await this.waitTx(tx);
		} catch (e) {
			return dangerNotification(`Error redeeming the land ${landId}`, e.message);
		}
	};

	// Returns true for a successful approval or false otherwise
	approveErc721Token = async (hexId, isLandId) => {
		let landId = parseInt(hexId, 16);
		if (isLandId) {
			landId = hexId;
		}
		const existingApproval = await this.state.ovr721.getApprovedAsync(landId);
		if (existingApproval === icoAddress) return true;
		try {
			const tx = await this.state.ovr721.approveAsync(icoAddress, landId, {
				gasPrice: window.web3.toWei(30, 'gwei'),
			});
			await this.waitTx(tx);
		} catch (e) {
			dangerNotification('Error approving the OVR land token', e.message);
			return false;
		}
		return true;
	};

	approveOvrTokens = async () => {
		let currentBalance = await this.state.ovr.balanceOfAsync(window.web3.eth.defaultAccount);
		let currentAllowance = await this.state.ovr.allowanceAsync(window.web3.eth.defaultAccount, icoAddress);
		// Allow all the tokens
		if (currentBalance.greaterThan(currentAllowance)) {
			try {
				const tx = await this.state.ovr.approveAsync(icoAddress, currentBalance, {
					gasPrice: window.web3.toWei(30, 'gwei'),
				});
				await this.waitTx(tx);
			} catch (e) {
				dangerNotification(
					'Approval error',
					'There was an error processing the approval of your tokens try again in a few minutes',
				);
				return false;
			}
		}
		return true;
	};

	buyLand = async (hexId) => {
		const landId = parseInt(hexId, 16);
		const tx = await this.state.ico.buyLandAsync(landId, {
			gasPrice: window.web3.toWei(30, 'gwei'),
		});
		await this.waitTx(tx);
	};

	// To put a land on sale or remove it. Will approve the ERC721 first.
	// The price can be 0 to give it away for free
	putLandOnSale = async (hexId, price, onSale) => {
		const landId = parseInt(hexId, 16);
		try {
			const tx = await this.state.ico.putLandOnSaleAsync(landId, price, onSale, {
				gasPrice: window.web3.toWei(30, 'gwei'),
			});
			await this.waitTx(tx);
		} catch (e) {
			return dangerNotification('Error listing the land on sale', e.message);
		}
		successNotification('Successful land listing', 'Your land has been listed successfully');
	};

	// Centralized Notifications

	toggleShowNotificationCenter = () => {
		this.setState({ showNotificationCenter: !this.state.showNotificationCenter });
	};

	closeNotificationCenter = () => {
		this.setState({ showNotificationCenter: false });
	};

	setNotificationAsReaded = (notification_uuid) => {
		let notifications_content = this.state.user.notifications.content;
		let unreaded_count = this.state.user.notifications.unreadedCount;

		notifications_content.readNotification(notification_uuid);
		unreaded_count = unreaded_count - 1;

		this.setState({
			user: {
				...this.state.user,
				notifications: {
					...this.state.user.notifications,
					unreadedCount: unreaded_count,
					content: notifications_content,
				},
			},
		});
	};

	setAllNotificationsAsReaded = () => {
		let notifications_content = this.state.user.notifications.content;
		notifications_content.readAllNotifications();
		this.setState({
			user: {
				...this.state.user,
				notifications: {
					...this.state.user.notifications,
					unreadedCount: 0,
					content: notifications_content,
				},
			},
		});
	};

	// Sockets

	liveSocket = () => {
		var cable = ActionCable.createConsumer(config.apis.socket);

		cable.subscriptions.create(
			{ channel: 'UsersChannel', user_uuid: this.state.user.uuid },
			{
				received: (data) => {
					const { notification } = data;
					const { balance } = data;
					const { unreaded_count } = data;

					this.setState({
						user: {
							...this.state.user,
							balance: balance,
							notifications: {
								...this.state.user.notifications,
								unreadedCount: unreaded_count,
								content: [notification, ...this.state.user.notifications.content],
							},
						},
					});
				},
			},
		);
	};

	offerToBuyLand = async (hexId, price, expirationDate) => {
		const landId = parseInt(hexId, 16);
		const tx = await this.state.ico.offerToBuyLandAsync(landId, price, expirationDate, {
			gasPrice: window.web3.toWei(30, 'gwei'),
		});
		await this.waitTx(tx);
	};

	getOffersToBuyLand = async (hexId) => {
		const landId = parseInt(hexId, 16);
		const landOfferIds = await this.state.ico.getLandOffersAsync(landId);
		let offers = [];
		const latestGroupCounter = String(await this.state.ico.groupCountersAsync(landId));
		for (let i = 0; i < landOfferIds.length; i++) {
			const landOfferId = landOfferIds[i];
			const offer = await this.state.ico.landOffersAsync(String(landOfferId));
			// If this offer is not for the most recent group, skip it
			if (parseInt(offer[2]) != latestGroupCounter) continue;
			offers.push(offer);
		}
		offers = offers.map((offer) => ({
			id: String(offer[0]),
			by: offer[1],
			group: parseInt(offer[2]),
			landId: String(offer[3]),
			price: String(window.web3.fromWei(offer[4])),
			timestamp: String(offer[5]),
			expirationDate: String(offer[6]),
			state: String(offer[7]),
		}));
		return offers;
	};

	cancelBuyOffer = async (offerId) => {
		return this.state.ico.cancelBuyOfferAsync(offerId, {
			gasPrice: window.web3.toWei(30, 'gwei'),
		});
	};

	declineBuyOffer = async (offerId) => {
		return this.state.ico.respondToBuyOfferAsync(offerId, false, {
			gasPrice: window.web3.toWei(30, 'gwei'),
		});
	};

	acceptBuyOffer = async (offerId) => {
		return this.state.ico.respondToBuyOfferAsync(offerId, true, {
			gasPrice: window.web3.toWei(30, 'gwei'),
		});
	};

	/**
	 * Sets the number of tokens you get per ether and the number of tokens for stablecoins
	 */
	getPrices = () => {
		return new Promise(async resolve => {
			const receivedPerEth = Number(await this.state.tokenBuy.tokensPerEthAsync());
			const receivedPerUsd = Number(await this.state.tokenBuy.tokensPerUsdAsync());
			this.setState({
				perEth: receivedPerEth,
				perUsd: receivedPerUsd,
			}, resolve);
		})
	};

	/**
	 * To buy OVR ERC20 tokens from the TokenBuy contract.
	 * When buying with stablecoins, you must first approve them which is done here automatically that's why you can expect to receive 2 transaction notifications from metamask
	 * @param {String} type The type of payment chosen
	 */
	buy = async (tokensToBuy, type) => {
		if (tokensToBuy <= 0) return warningNotification('Setup error', 'You must input more than 0 OVR tokens to buy');
		await this.getPrices()
		try {
			switch (type) {
				case 'eth':
					const value = tokensToBuy / this.state.perEth;
					const tx = await this.state.tokenBuy.buyTokensWithEthAsync({
						value,
						gasPrice: window.web3.toWei(30, 'gwei'),
					});
					await this.waitTx(tx);
					break;
				case 'usdt':
					await this.buyWithToken(tokensToBuy, this.state.tether, 'usdt');
					break;
				case 'usdc':
					await this.buyWithToken(tokensToBuy, this.state.usdc, 'usdc');
					break;
				case 'dai':
					await this.buyWithToken(tokensToBuy, this.state.dai, 'dai');
					break;
				default:
					warningNotification('Error', 'The currency selected is not correct');
					break;
			}
			this.getOvrsOwned();
		} catch (e) {
			console.log('Error', e);
			warningNotification(
				'Error buying tokens',
				'There was an error processing your transaction refresh this page and try again',
			);
		}
	};

	buyWithCard = async (tokensToBuy, cardNum, month, year, cvv, zip) => {
		await this.getPrices()
		// tokensToBuy
		let response;
		const dataToSend = {
			amount: String(window.web3.fromWei((tokensToBuy / this.state.perUsd) * 100)), // Must be in cents so 1 dollar is 100
			addressReceiver: window.web3.eth.defaultAccount,
			card: {
				cardNum,
				cardExpiry: {
					month,
					year,
				},
				cvv,
			},
			billingDetails: { zip },
		};

		try {
			const request = await fetch(FIAT_BUY_URL, {
				method: 'post',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify(dataToSend),
			});
			response = await request.json();
		} catch (e) {
			return dangerNotification(
				'Error processing the payment',
				'There was an error making the credit card purchase refresh the page and try again later',
			);
		}

		if (!response) {
			return dangerNotification('Error', 'No response received from the payment server');
		} else if (!response.ok) {
			return dangerNotification('Error buying', response.msg);
		}

		successNotification(
			'Purchase successful',
			'The purchase was completed successfully. It may take between 1 and 3 minutes to see your new tokens.',
		);
	};

	buyWithToken = async (tokensToBuy, token, type) => {
		let currentBalance = await token.balanceOfAsync(window.web3.eth.defaultAccount);
		let currentAllowance = await token.allowanceAsync(window.web3.eth.defaultAccount, tokenBuyAddress);
		// Allow all the tokens
		if (currentBalance.greaterThan(currentAllowance)) {
			try {
				const response = await token.approveAsync(tokenBuyAddress, currentBalance);
				await this.waitTx(response);
			} catch (e) {
				return warningNotification('Error approving tokens', 'There was an error approving the tokens');
			}
		}
		// Check if the user has enough balance to buy those tokens
		if (currentBalance.lessThan(tokensToBuy)) {
			return warningNotification(
				'Not enough tokens',
				`You don't have enough to buy ${window.web3.fromWei(tokensToBuy)} OVR tokens`,
			);
		}
		try {
			let tx;
			switch (type) {
				case 'dai':
					tx = await this.state.tokenBuy.buyTokensWithDaiAsync(tokensToBuy, {
						gasPrice: window.web3.toWei(30, 'gwei'),
					});
					break;
				case 'usdt':
					tx = await this.state.tokenBuy.buyTokensWithUsdtAsync(tokensToBuy, {
						gasPrice: window.web3.toWei(30, 'gwei'),
					});
					break;
				case 'usdc':
					tx = await this.state.tokenBuy.buyTokensWithUsdcAsync(tokensToBuy, {
						gasPrice: window.web3.toWei(30, 'gwei'),
					});
					break;
				default:
					warningNotification('Error', 'The currency selected is not correct');
					break;
			}
			await this.waitTx(tx);
		} catch (e) {
			return warningNotification('Error buying', `There was an error buying your OVR tokens`);
		}
	};

	render() {
		return (
			<UserContext.Provider
				value={{
					state: this.state,
					actions: {
						loginUser: this.loginUser,
						toggleShowNotificationCenter: this.toggleShowNotificationCenter,
						closeNotificationCenter: this.closeNotificationCenter,
						notification: {
							setAsReaded: this.setNotificationAsReaded,
							setAllAsReaded: this.setAllNotificationsAsReaded,
						},
						getOvrsOwned: this.getOvrsOwned,
						waitTx: this.waitTx,
						setupWeb3: this.setupWeb3,
						redeemLands: this.redeemLands,
						putLandOnSale: this.putLandOnSale,
						approveErc721Token: this.approveErc721Token,
						approveOvrTokens: this.approveOvrTokens,
						buyLand: this.buyLand,
						offerToBuyLand: this.offerToBuyLand,
						getOffersToBuyLand: this.getOffersToBuyLand,
						cancelBuyOffer: this.cancelBuyOffer,
						declineBuyOffer: this.declineBuyOffer,
						acceptBuyOffer: this.acceptBuyOffer,
						redeemSingleLand: this.redeemSingleLand,
						buyWithToken: this.buyWithToken,
						buyWithCard: this.buyWithCard,
						buy: this.buy,
						getPrices: this.getPrices,
					},
				}}
			>
				{this.props.children}
			</UserContext.Provider>
		);
	}
}

export function withUserContext(Component) {
	class ComponentWithContext extends React.Component {
		render() {
			return (
				<UserContext.Consumer>
					{(value) => <Component {...this.props} userProvider={{ ...value }} />}
				</UserContext.Consumer>
			);
		}
	}

	return ComponentWithContext;
}
