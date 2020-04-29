import React, { useState, useContext } from 'react';
import { store } from 'react-notifications-component';
import { Link, useHistory } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import HexButton from '../../components/HexButton/HexButton';
import { UserContext, withUserContext } from '../../context/UserContext';

import { signIn } from '../../lib/api';

/**
 * Login page component
 */

const Login = (props) => {
	const context = useContext(UserContext);
	let history = useHistory();

	const [loginName, setLoginName] = useState('');
	const [inputNameError] = useState(false);

	const [loginPassword, setLoginPassword] = useState('');
	const [inputPasswordError] = useState(false);
	const [isFormValid, setIsFormValid] = useState(false);

	//
	// State management and form control
	//
	const checkFormValidity = () => {
		if (loginPassword === '' || loginName === '') {
			setIsFormValid(false);
		} else {
			setIsFormValid(true);
		}
	};

	const changeLoginName = (e) => {
		setLoginName(e.target.value);
		checkFormValidity();
	};
	const changeLoginPassword = (e) => {
		setLoginPassword(e.target.value);
		checkFormValidity();
	};

	// Submit login function, call api's manage state contest

	const submitLogin = (e) => {
		// Call API function
		signIn(loginName, loginPassword)
			.then((response) => {
				console.log(response);
				if (response.data.result === true) {
					// Load user data in context store
					context.actions.loginUser(response.data.token, response.data.user);

					// Redirect
					history.push('/map/overview');

					// Notify user
					store.addNotification({
						title: 'Login complete',
						message: 'Welcome back',
						type: 'success',
						insert: 'top',
						container: 'top-right',
						animationIn: ['animated', 'fadeIn'],
						animationOut: ['animated', 'fadeOut'],
						showIcon: true,
						dismiss: {
							duration: 5000,
						},
					});
				} else {
					// Notify user if login fail
					store.addNotification({
						title: 'Login failed',
						message: response.data.errors[0].message,
						type: 'danger',
						insert: 'top',
						container: 'top-right',
						animationIn: ['animated', 'fadeIn'],
						animationOut: ['animated', 'fadeOut'],
						showIcon: true,
						dismiss: {
							duration: 5000,
						},
					});
				}
			})
			.catch(() => {
				// Notify user if network error
				store.addNotification({
					title: 'Connection error',
					message: 'Check your internet connection or try again later',
					type: 'danger',
					insert: 'top',
					container: 'top-right',
					animationIn: ['animated', 'fadeIn'],
					animationOut: ['animated', 'fadeOut'],
					showIcon: true,
					dismiss: {
						duration: 5000,
					},
				});
			});
	};

	//
	// Return
	//

	return (
		<div className="Login">
			<div className="o-container">
				<h2>Welcome back to OVR</h2>
				<div className="Login__sub-title">
					We're so pleased you're here. You can browse the OVRLands and track your auctions using your account.
				</div>
				<div className="Login__form-container">
					<form>
						<div className="Login__input">
							<TextField
								id="loginName"
								label="Username"
								type="text"
								error={inputNameError !== false ? true : false}
								helperText={inputNameError !== false ? inputNameError : ''}
								onFocus={changeLoginName}
								onChange={changeLoginName}
								onKeyUp={changeLoginName}
							/>
						</div>
						<div className="Login__input">
							<TextField
								id="loginPassword"
								label="Password"
								type="password"
								error={inputPasswordError !== false ? true : false}
								helperText={inputPasswordError !== false ? inputPasswordError : ''}
								onFocus={changeLoginPassword}
								onChange={changeLoginPassword}
								onKeyUp={changeLoginPassword}
							/>
						</div>
						<div className="Login__input">
							<HexButton
								url="#"
								text="Login"
								className={`--purple ${isFormValid ? '' : '--disabled'}`}
								onClick={submitLogin}
							></HexButton>
						</div>
					</form>
				</div>
				<div className="Login__signup">
					You don't have an account? <Link to="/signup">Signup</Link>
				</div>
				<div className="Login__forgot">
					<Link to="/signup">Forgot your password?</Link>
				</div>
				<div className="Login__footer">
					If you have any question about your account visit <Link to="/FAQs">FAQs</Link> or contact{' '}
					<Link to="mailto:info@ovr.ai">info@ovr.ai</Link>
				</div>
			</div>
		</div>
	);
};

export default withUserContext(Login);
