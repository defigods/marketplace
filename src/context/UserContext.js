import React, { createContext, Component } from 'react';
import Web3 from 'web3';
import { saveToken, isLogged, getToken, removeUser } from '../lib/auth';
import { userProfile } from '../lib/api';
import { successNotification, networkError, dangerNotification, warningNotification } from '../lib/notifications';
import config from '../lib/config';
import { promisifyAll } from 'bluebird';
import { tokenBuyAddress, daiAddress, tetherAddress, usdcAddress, ovrAddress, icoAddress, ovr721Address } from '../lib/contracts';
import { tokenBuyAbi, erc20Abi, icoAbi, ovr721Abi } from '../lib/abis';
import { zhCN } from 'date-fns/esm/locale';

let ActionCable = require('actioncable');

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
		};
	}

	componentDidMount() {
		this.setupWeb3();
		if (isLogged()) {
			userProfile()
				.then((response) => {
					if (response.data.result === true) {
						this.setState({ user: response.data.user });
						this.liveSocket();
					} else {
						dangerNotification('Session expired', 'Please login again');
						removeUser();
					}
				})
				.catch(() => {
					// Notify user if network error
					networkError();
				});

			this.loginUser(getToken('userToken'), getToken('userUuid'));
		}
	}

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
	setupWeb3 = async () => {
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
		this.refreshWhenAccountsChanged();
		this.updateBalanceWhenChanged();
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
		window.ethereum.on('accountsChanged', function (accounts) {
			window.location.reload();
		});
	};

	// Checks every second if the balance has changed and updates it
	updateBalanceWhenChanged = async () => {
		setInterval(() => this.getOvrsOwned(), 1e3);
	};

	getOvrsOwned = async () => {
		const ovrsOwned = String(window.web3.fromWei(await this.state.ovr.balanceOfAsync(window.web3.eth.defaultAccount)));
		this.setState({ ovrsOwned });
	};

	loginUser = (token, user) => {
		this.setState({ isLoggedIn: true, token: token, user: user });
		// Cookie management
		saveToken('userToken', token);
		saveToken('userUuid', user);
		this.liveSocket();
	};

	liveSocket = () => {
		// console.log('live sockets', this.state.user.uuid);
		// Sockets
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

	toggleShowNotificationCenter = () => {
		this.setState({ showNotificationCenter: !this.state.showNotificationCenter });
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
			if (landState != 2 &&
				land[0] == window.web3.eth.defaultAccount && 
				timePassedInSeconds >= auctionTime) {
				try {
					await this.state.ico.redeemWonLandAsync(activeLandsIds[i]);
					landsRedeemed++;
				} catch (e) {
					return dangerNotification(`Error redeeming the land ${activeLandsIds[i]}`, e.message);
				}
 			}
		}
		if (landsRedeemed == 0) {
			warningNotification('No lands to redeem', "You don't have any lands to redeem for now. Check in a few hours when the auction time is reached.");
		} else {
			successNotification('Your lands are on their way!', "You'll receive your lands in a few minutes");
		}
	};

	// To put a land on sale or remove it. Will approve the ERC721 first.
	// The price can be 0 to give it away for free
	putLandOnSale = async (hexId, price, onSale) => {
		const landId = parseInt(hexId, 16);
		try {
			const tx = await this.state.ovr721.approveAsync(icoAddress, landId);
			await this.waitTx(tx);
		} catch (e) {
			return dangerNotification('Error approving the OVR land token', e.message);
		}
		try {
			const tx = await this.state.ico.putLandOnSaleAsync(landId, price, onSale);
			await this.waitTx(tx);
		} catch (e) {
			return dangerNotification('Error listing the land on sale', e.message);
		}
		successNotification('Successful land listing', "Your land has been listed successfully");
	};

	render() {
		return (
			<UserContext.Provider
				value={{
					state: this.state,
					actions: {
						loginUser: this.loginUser,
						toggleShowNotificationCenter: this.toggleShowNotificationCenter,
						notification: {
							setAsReaded: this.setNotificationAsReaded,
							setAllAsReaded: this.setAllNotificationsAsReaded,
						},
						getOvrsOwned: this.getOvrsOwned,
						waitTx: this.waitTx,
						setupWeb3: this.setupWeb3,
						redeemLands: this.redeemLands,
						putLandOnSale: this.putLandOnSale,
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
