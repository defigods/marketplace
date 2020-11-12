import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useHistory } from 'react-router-dom';
import { withWeb3Context, Web3Context } from '../../context/Web3Context';
import { MapContext } from '../../context/MapContext';
import { useTranslation } from 'react-i18next'
import { UserContext } from '../../context/UserContext';
import ReactGA from 'react-ga';

/**
 * Login page component
 */

const Login = (props) => {
	const { t, i18n } = useTranslation();
	const web3Context = useContext(Web3Context);
	const mapContext = useContext(MapContext);
	const userContext = useContext(UserContext);
	let history = props.history;

	useEffect(() => {
		ReactGA.set({ page: window.location.pathname }); // Update the user's current page
		ReactGA.pageview(window.location.pathname); // Record a pageview for the given page
		// Login via web3

		if(userContext.state.isLoggedIn){
			history.push('/profile');
		}
/* 		web3Context.actions.setupWeb3(() => {
			history.push('/profile');
			// TODO: KYC - history.push('map/discover');
			// console.log('login here eheh');
			if (mapContext.state.onSingleView) {
				history.push('/map/land/' + mapContext.state.hex_id);
			}
			// onSingleView
		}); */
	}, [userContext.state.isLoggedIn]);

	//
	// Return
	//

	return (
		<div className="Login">
			<div className="o-container">
				<h2>{t('Login.welcome.back')}</h2>
				<div className="Login__sub-title">
					{t('Login.use.metamask')}
				</div>
				<div className="Login__footer">
					{t('Login.contact.us')} {' '}
					<Link to="mailto:info@ovr.ai">info@ovr.ai</Link>
				</div>
			</div>
		</div>
	);
};

export default withWeb3Context(Login);
