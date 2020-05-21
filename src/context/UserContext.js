import React, { createContext, Component } from 'react';
import Web3 from 'web3';
import { saveToken, isLogged, getToken, removeUser } from '../lib/auth';
import { userProfile, getUserNonce, signUpPublicAddress, signIn } from '../lib/api';
import { networkError, dangerNotification, warningNotification } from '../lib/notifications';
import config from '../lib/config';
import { promisifyAll } from 'bluebird';
import { tokenBuyAddress, daiAddress, tetherAddress, usdcAddress, ovrAddress, icoAddress } from '../lib/contracts';
import { tokenBuyAbi, erc20Abi, icoAbi } from '../lib/abis';
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
			setupComplete: false,
		};
	}

	componentDidMount() {
		if (isLogged()) {
			this.lightSetupWeb3()

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

	loginUser = (token, user) => {
		this.setState({ isLoggedIn: true, token: token, user: user });
		// Cookie management
		saveToken('userToken', token);
		saveToken('userUuid', user);
		this.liveSocket();
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
	setupWeb3 = async () => {
		console.log('render setupweb3')
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
		let publicAddress = window.web3.eth.defaultAccount.toLowerCase()
		this.handleCentralizedLogin(publicAddress);

		// Helpers
		this.refreshWhenAccountsChanged();
		this.updateBalanceWhenChanged();
		await this.setupContracts();
		await this.getOvrsOwned();
	};

	// if the user is logged in with a valid token just reload datas
	lightSetupWeb3 = async () => {
		window.web3.eth.defaultAccount = window.web3.eth.accounts[0];
		this.updateBalanceWhenChanged();
		await this.setupContracts();
		await this.getOvrsOwned();
	}

	setupContracts = async () => {
		const _dai = window.web3.eth.contract(erc20Abi).at(daiAddress);
		const _tether = window.web3.eth.contract(erc20Abi).at(tetherAddress);
		const _usdc = window.web3.eth.contract(erc20Abi).at(usdcAddress);
		const _tokenBuy = window.web3.eth.contract(tokenBuyAbi).at(tokenBuyAddress);
		const _ovr = window.web3.eth.contract(erc20Abi).at(ovrAddress);
		const _ico = window.web3.eth.contract(icoAbi).at(icoAddress);
		this.setState({
			dai: promisifyAll(_dai),
			tether: promisifyAll(_tether),
			usdc: promisifyAll(_usdc),
			tokenBuy: promisifyAll(_tokenBuy),
			ovr: promisifyAll(_ovr),
			ico: promisifyAll(_ico),
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
		if (this.state.ovr && this.state.setupComplete && window.web3.eth.defaultAccount){
			const ovrsOwned = String(window.web3.fromWei(await this.state.ovr.balanceOfAsync(window.web3.eth.defaultAccount)));
			this.setState({ ovrsOwned });
		}
	};


	// 
	// Centralized authentication with Metamask
	//  

	handleCentralizedLogin(publicAddress){
		getUserNonce(publicAddress).then((response) => {
			if (response.data.result === true) {
				let nonce = response.data.user.nonce
				this.handleUserSignMessage(publicAddress, nonce)
			} else {
				this.handleCentralizedSignup(publicAddress)
			}
		})
	};

	handleCentralizedSignup = publicAddress => {
		signUpPublicAddress(publicAddress).then((response) => {
			if (response.data.result === true) {
				this.handleCentralizedLogin(publicAddress)
			} else {
				dangerNotification('Unable to register public address', response.data.errors[0].message);
			}
		})
	};

	handleUserSignMessage = (publicAddress, nonce) => {
		return new Promise((resolve, reject) =>
			window.web3.personal.sign(
					window.web3.fromUtf8(`I am signing my one-time nonce: ${nonce}`),
					publicAddress,
					(err, signature) => {
							if (err) return reject(err);
							this.handleAuthenticate(publicAddress, signature)
					}
			)
		);
	};

	handleAuthenticate = ( publicAddress, signature ) => {
		signIn(publicAddress, signature).then((response) => {
			if (response.data.result === true) {
				// Save data in store 
				this.loginUser(response.data.token, response.data.user);
			} else {
				dangerNotification('Unable to login', response.data.errors[0].message);
			}
		})
	};


	// Centralized Notifications

	toggleShowNotificationCenter = () => {
		this.setState({ showNotificationCenter: !this.state.showNotificationCenter });
	};

	setNotificationAsReaded = (notification_uuid) => {
		let notifications_content = this.state.user.notifications.content
		let unreaded_count = this.state.user.notifications.unreadedCount

		notifications_content.readNotification(notification_uuid)
		unreaded_count = unreaded_count - 1

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
		let notifications_content = this.state.user.notifications.content
		notifications_content.readAllNotifications()
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

	//
	// Render
	//

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
