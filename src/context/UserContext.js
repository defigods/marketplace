import React, { createContext, Component } from 'react';
import { saveToken, isLogged, getToken, removeUser } from '../lib/auth';
import { userProfile } from '../lib/api';
import { networkError, dangerNotification } from '../lib/notifications';

export const UserContext = createContext();

export class UserProvider extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoggedIn: false,
			token: null,
			user: {
				uuid: null,
			},
			showNotificationCenter: false,
		};
		this.loginUser = this.loginUser.bind(this);
		this.toggleShowNotificationCenter = this.toggleShowNotificationCenter.bind(this);
	}

	componentDidMount() {
		if (isLogged()) {
			userProfile()
				.then((response) => {
					if (response.data.result === true) {
						this.setState({ user: response.data.user });
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

	loginUser(token, user) {
		this.setState({ isLoggedIn: true, token: token, user: user });
		// Cookie management
		saveToken('userToken', token);
		saveToken('userUuid', user);
	}

	toggleShowNotificationCenter() {
		this.setState({ showNotificationCenter: !this.state.showNotificationCenter });
	}

	render() {
		return (
			<UserContext.Provider
				value={{
					state: this.state,
					actions: { loginUser: this.loginUser, toggleShowNotificationCenter: this.toggleShowNotificationCenter },
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
