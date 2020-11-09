import React, { useContext, useEffect, useState } from 'react';
import HexButton from '../../components/HexButton/HexButton';
import TextField from '@material-ui/core/TextField';

import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleSharpIcon from '@material-ui/icons/CheckCircleSharp';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import config from '../../lib/config';
import { signUpHybrid, signUpHybridSocial } from '../../lib/api';
import { saveToken } from '../../lib/auth';
import { dangerNotification } from '../../lib/notifications';

import { Web3Context, withWeb3Context } from '../../context/Web3Context';
import { UserContext, withUserContext } from '../../context/UserContext';

import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';

import Web3 from 'web3';
import { GoogleLogin } from 'react-google-login';
import FacebookLoginWithButton from '../../facebook/facebook-with-button';

import { useTranslation } from 'react-i18next'


/**
 * LoginHelper page component
 */

const LoginHelper = () => {
	const { t, i18n } = useTranslation()

	const context = useContext(Web3Context);
	const userContext = useContext(UserContext);

	let history = useHistory();

	useEffect(() => {
		// If user is logged in
		if (userContext.state.isLoggedIn) {
			history.push('/profile');
		}
		// Load Web3
		const ethereum = window.ethereum;
		async function startEth() {
			if (typeof ethereum !== 'undefined') {
				try {
					await ethereum.enable();
				} catch (e) {
					// console.log(e);
				}
				window.web3 = new Web3(ethereum);
			} else if (typeof window.web3 !== 'undefined') {
				window.web3 = new Web3(window.web3.currentProvider);
				window.web3.eth.defaultAccount = window.web3.eth.accounts[0];
			}
		}
		startEth();
}, []); //window.web3.networkVersion, window.web3.eth.defaultAccount, window.web3.eth.accounts[0]

	function metamaskComponent() {
		let isWeb3Active = typeof window.web3 !== 'undefined';
		let isWeb3Account = false;
		let web3NetworkVersion = false;
		if (isWeb3Active) {
			isWeb3Account = window.web3.eth.accounts.length > 0;
			web3NetworkVersion = parseInt(window.ethereum.chainId, 16) === config.web3network;
		}
		return(
			<div className="o-container">
				<div className="o-box">
					<h1>{t('Signup.first.things')}</h1>
					<div className="Signup__section --left">
						{isWeb3Active ? (
							<div className="o-list">
								<CheckCircleSharpIcon className="CheckCircleSharpIcon" /> {t('Signup.web3.install')}
							</div>
						) : (
							<div className="o-list">
								<CancelIcon className="CancelIcon" /> {t('Signup.web3.install')}
							</div>
						)}
						{isWeb3Account ? (
							<div className="o-list">
								<CheckCircleSharpIcon className="CheckCircleSharpIcon" /> {t('Signup.web3.login')}
							</div>
						) : (
							<div className="o-list">
								<CancelIcon className="CancelIcon" /> {t('Signup.web3.login')}
							</div>
						)}
						{web3NetworkVersion ? (
							<div className="o-list">
								<CheckCircleSharpIcon className="CheckCircleSharpIcon" /> {t('Signup.connect.to')}{' '}
								{String(config.web3network) === '3' ? 'Ropsten' : 'Mainnet'} {t('Signup.network')}
							</div>
						) : (
							<div className="o-list">
								<CancelIcon className="CancelIcon" /> {t('Signup.connect.to')}{' '}
								{String(config.web3network) === '3' ? 'Ropsten' : 'Mainnet'} {t('Signup.network')}
							</div>
						)}
					</div>
					{/* <div className="ignore-this">
						For debug only, ignore this:
						{isWeb3Active.toString()}
						<br></br>
						{web3NetworkVersion.toString()}
						<br></br>
						{isWeb3Account.toString()}
						<br></br>
						{typeof window.web3}
						<br></br>
						{window.web3 ? window.web3.eth.accounts : ''}
						<br></br>
						{window.web3 ? window.ethereum.networkVersion : ''}
						<br></br>
					</div> */}
					{isWeb3Active && web3NetworkVersion && isWeb3Account ? (
						<>
							<div className="Signup__section Signup__msg --positive">{t('Signup.web3.present')}</div>
						</>
					) : (
						<>
							<div className="Signup__section Signup__msg --negative">
								{t('Signup.web3.not.present')}
							</div>
							<div className="Signup__section">
								<HexButton
									url="https://metamask.io"
									text="Install MetaMask"
									target="_blank"
									className={'--purple'}
								></HexButton>
							</div>
						</>
					)}
				</div>
			</div>
		)
	}
	//
	// Return
	//

	return <div className="Signup">{metamaskComponent()}</div>;
};

export default withWeb3Context(LoginHelper);
