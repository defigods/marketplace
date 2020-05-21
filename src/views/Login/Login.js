import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { UserContext, withUserContext } from '../../context/UserContext';
import { useHistory } from 'react-router-dom';

/**
 * Login page component
 */

const Login = () => {
	const context = useContext(UserContext);
	let history = useHistory();

	useEffect(() => {
		// Login via web3
		context.actions.setupWeb3().then(() => {
			// Redirect to overview
			//history.push('/map/overview');
		});
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
