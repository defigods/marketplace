import React, { createContext, Component } from 'react';
import Web3 from 'web3';
import { saveToken, isLogged, getToken, removeUser } from '../lib/auth';
import { userProfile } from '../lib/api';
import { networkError, dangerNotification, warningNotification } from '../lib/notifications';
import config from '../lib/config';
import { promisifyAll } from 'bluebird';
import { tokenBuyAddress, daiAddress, tetherAddress, usdcAddress, ovrAddress } from '../lib/contracts';
import { tokenBuyAbi, erc20Abi } from '../lib/abis';
import { zhCN } from 'date-fns/esm/locale';
let ActionCable = require('actioncable');

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
		};
	}

	componentDidMount() {
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
			this.setupWeb3();
		}
	}

	// Note: the web3 version is always 0.20.7 because of metamask
	setupWeb3 = async () => {
		const ethereum = window.ethereum;
		if (typeof ethereum !== 'undefined') {
			try {
				await ethereum.enable();
			} catch (e) {
				warningNotification('Metamask permission error', 'You must accept the connection request to continue');
			}
			window.web3 = new Web3(ethereum);
		} else if (typeof window.web3 !== 'undefined') {
			window.web3 = new Web3(window.web3.currentProvider);
		} else {
			warningNotification('Metamask not detected', 'You must login to metamask to use this application');
		}
		window.web3.eth.defaultAccount = window.web3.eth.accounts[0];
		await this.setupContracts();
		await this.getOvrsOwned();
	}

	setupContracts = async () => {
		const _dai = window.web3.eth.contract(erc20Abi).at(daiAddress);
		const _tether = window.web3.eth.contract(erc20Abi).at(tetherAddress);
		const _usdc = window.web3.eth.contract(erc20Abi).at(usdcAddress);
		const _tokenBuy = window.web3.eth.contract(tokenBuyAbi).at(tokenBuyAddress);
		const _ovr = window.web3.eth.contract(erc20Abi).at(ovrAddress);
		this.setState({
			dai: promisifyAll(_dai),
			tether: promisifyAll(_tether),
			usdc: promisifyAll(_usdc),
			tokenBuy: promisifyAll(_tokenBuy),
			ovr: promisifyAll(_ovr),
		});
	}

	getOvrsOwned = async () => {
		const ovrsOwned = String(window.web3.fromWei(await this.state.ovr.balanceOfAsync(window.web3.eth.defaultAccount)));
		this.setState({ ovrsOwned });
	}

	loginUser = (token, user) => {
		this.setState({ isLoggedIn: true, token: token, user: user });
		// Cookie management
		saveToken('userToken', token);
		saveToken('userUuid', user);
		this.liveSocket();
	};

	liveSocket = () => {
		console.log('live sockets', this.state.user.uuid);
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

	render() {
		return (
			<UserContext.Provider
				value={{
					state: this.state,
					actions: { loginUser: this.loginUser, toggleShowNotificationCenter: this.toggleShowNotificationCenter, getOvrsOwned: this.getOvrsOwned },
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
