import React, { createContext, Component } from 'react';
import { removeToken, saveToken, isLogged, getToken, removeUser } from '../lib/auth';
import { successNotification, networkError, dangerNotification, warningNotification } from '../lib/notifications';
import { userProfile, getUserNonce, signUpPublicAddress, signIn } from '../lib/api';
import config, { camelCaseKeys } from '../lib/config';
let ActionCable = require('actioncable');


export const UserContext = createContext();

export class UserProvider extends Component {

	constructor(props) {
		super(props);

		this.state = {
			isLoggedIn: false,
			subscribedToLiveSockets: false,
			showNotificationCenter: false,
			token: null,
			user: {
				uuid: null,
			}
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
						this.logoutUser();
					}
				})
				.catch(() => {
					// Notify user if network error
					networkError();
				});

			this.loginUser(getToken('userToken'), getToken('userUuid'));
		}
	}

	setUserState = (user) => {
		this.setState({ user: user });
	}

	loginUser = (token, user) => {
		this.setState({ isLoggedIn: true, token: token, user: user });
		// Cookie management
		saveToken('userToken', token);
		saveToken('userUuid', user);
		this.liveSocket();
	};

	logoutUser = () => {
		this.setState({ isLoggedIn: false, token: null, user: { uuid: null } });
		// Cookie management
		removeToken('userToken');
		removeToken('userUuid');
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
		if (this.state.isLoggedIn && !this.state.subscribedToLiveSockets){
			this.setState({subscribedToLiveSockets: true})
			var cable = ActionCable.createConsumer(config.apis.socket);

			cable.subscriptions.create(
				{ channel: 'UsersChannel', user_uuid: this.state.user.uuid },
				{
					received: (data) => {
						const { notification } = data;
						const { balance } = data;
						const { unreaded_count } = data;
						// Update state on new notification
						this.setState({
							user: {
								...this.state.user,
								balance: balance,
								notifications: {
									...this.state.user.notifications,
									unreadedCount: unreaded_count,
									content: [camelCaseKeys(notification), ...this.state.user.notifications.content],
								},
							},
						});
					},
				},
			);
		}
		console.log('liveSockets Called')
	};


	render() {
		return (
			<UserContext.Provider
				value={{
					state: this.state,
					actions: {
						loginUser: this.loginUser,
						logoutUser: this.logoutUser,
						setUserState: this.setUserState,
						toggleShowNotificationCenter: this.toggleShowNotificationCenter,
						closeNotificationCenter: this.closeNotificationCenter,
						notification: {
							setAsReaded: this.setNotificationAsReaded,
							setAllAsReaded: this.setAllNotificationsAsReaded,
						}
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
