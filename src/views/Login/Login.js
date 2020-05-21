import React, { useState, useContext, useEffect } from 'react';
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

	useEffect(() => {
		// Login via web3
		context.actions.setupWeb3();
		console.log('call function inside login')
	}, []);


	//
	// Return
	//

	return (
		<div className="Login">
			<div className="o-container">
				<h2>Welcome back to OVR</h2>
				<div className="Login__sub-title">We use MetaMask to authenticate Users. Please sign the nonce which will be used for this session.</div>
				<div className="Login__footer">
					If you have any question about your account visit <Link to="/FAQs">FAQs</Link> or contact{' '}
					<Link to="mailto:info@ovr.ai">info@ovr.ai</Link>
				</div>
			</div>
		</div>
	);
};

export default withUserContext(Login);
