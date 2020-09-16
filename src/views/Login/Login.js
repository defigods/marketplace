import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useHistory } from 'react-router-dom';
import { withWeb3Context, Web3Context } from '../../context/Web3Context';
import { MapContext } from '../../context/MapContext';

/**
 * Login page component
 */

const Login = () => {
	const web3Context = useContext(Web3Context);
	const mapContext = useContext(MapContext);
	let history = useHistory();

	useEffect(() => {
		// Login via web3
		web3Context.actions.setupWeb3(() => {
			history.push('map/discover');
			// console.log('login here eheh');
			if (mapContext.state.onSingleView) {
				history.push('/map/land/' + mapContext.state.hex_id);
			}
			// onSingleView
		});
	}, []);

	//
	// Return
	//

	return (
		<div className="Login">
			<div className="o-container">
				<h2>Welcome back to OVR</h2>
				<div className="Login__sub-title">
					We use MetaMask to authenticate Users. Please sign the nonce which will be used for this session.
				</div>
				<div className="Login__footer">
					If you have any question about your account visit <Link to="/FAQs">FAQs</Link> or contact{' '}
					<Link to="mailto:info@ovr.ai">info@ovr.ai</Link>
				</div>
			</div>
		</div>
	);
};

export default withWeb3Context(Login);
