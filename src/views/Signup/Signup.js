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

/**
 * Signup page component
 */

const Signup = () => {
	const context = useContext(Web3Context);
	const userContext = useContext(UserContext);

	let history = useHistory();
	const [activeStep, setActiveStep] = useState(0);
	const [userEmail, setUserEmail] = useState('');

	const [isSignupLoading, setIsSignupLoading] = useState(false);
	const [userEmailValid, setUserEmailValid] = useState(false);
	const [userEmailInputError, setUserEmailInputError] = useState(false);

	const [facebookToken, setFacebookToken] = useState(false);
	const [googleToken, setGoogleToken] = useState(false);

	const [username, setUsername] = useState('');
	const [usernameValid, setUsernameValid] = useState(false);
	const [usernameInputError, setUsernameInputError] = useState(false);

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
			}
			window.web3.eth.defaultAccount = window.web3.eth.accounts[0];
		}
		startEth();
	}, []);

	const handleNext = async () => {
		if (activeStep + 1 === 1) {
			setActiveStep((prevActiveStep) => prevActiveStep + 1);
		} else {
			setActiveStep((prevActiveStep) => prevActiveStep + 1);
		}
	};

	const emailRegexAndNext = async () => {
		if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail)) {
			handleNext();
		} else {
			setUserEmailInputError('The inserted email address is not a valid email address');
			setUserEmailValid(false);
		}
	};

	const updateUserEmail = (e) => {
		setUserEmailInputError(false);
		if (userEmail === '') {
			setUserEmailValid(false);
		} else {
			setUserEmailValid(true);
		}
		setUserEmail(e.target.value);
	};

	const updateUsername = (e) => {
		setUsernameInputError(false);
		if (username === '') {
			setUsernameValid(false);
		} else {
			setUsernameValid(true);
		}
		setUsername(e.target.value);
	};

	const handleSubscribe = () => {
		setIsSignupLoading(true);
		// window.web3.eth.defaultAccount = window.web3.eth.accounts[0];
		let publicAddress = window.web3.eth.defaultAccount.toLowerCase();
		if (googleToken == false && facebookToken == false) {
			signUpHybrid(userEmail, username, publicAddress).then((response) => {
				setIsSignupLoading(false);
				if (response.data.result === true) {
					handleNext();
				} else {
					let error_code = response.data.errors[0].code;
					let error_message = response.data.errors[0].message;
					if (error_code == 'public_address') {
						dangerNotification(error_message, 'Try to login instead');
						setActiveStep(0);
					} else if (error_code == 'email') {
						setActiveStep(2);
						setUserEmailValid(false);
						setUserEmailInputError(error_message);
					} else if (error_code == 'username') {
						setActiveStep(3);
						setUsernameValid(false);
						setUsernameInputError(error_message);
					}
				}
			});
		} else {
			let token;
			let provider;
			if (googleToken) {
				token = googleToken;
				provider = 'google';
			}
			if (facebookToken) {
				token = facebookToken;
				provider = 'facebook';
			}
			// console.log('token', token)
			// console.log('provider', provider)
			// console.log('username', username)
			// console.log('publicAdress', publicAddress)
			signUpHybridSocial(token, provider, username, publicAddress).then((response) => {
				setIsSignupLoading(false);
				if (response.data.result === true) {
					handleNext();
				} else {
					let error_code = response.data.errors[0].code;
					let error_message = response.data.errors[0].message;
					// console.log('response.data', response.data);
					if (error_code == 'public_address') {
						dangerNotification(error_message, 'Try to login instead');
						setActiveStep(0);
					} else if (error_code == 'token' || error_code == 'oauth') {
						setActiveStep(1);
						setUserEmailValid(false);
						setUserEmailInputError(error_message);
					} else if (error_code == 'username') {
						setActiveStep(3);
						setUsernameValid(false);
						setUsernameInputError(error_message);
					}
				}
			});
		}
	};

	const handleLogin = () => {
		context.actions.setupWeb3(() => {
			saveToken('firstAfterSignup', true);
			history.push('/profile');
			// TODO: KYC - history.push('map/discover');
		});
	};

	const responseGoogle = (response) => {
		// console.log('google', response);
		if (response.tokenId) {
			setGoogleToken(response.tokenId);
			handleNext();
		}
	};

	const responseFacebook = (response) => {
		// console.log('facebook', response);
		if (response.accessToken) {
			setFacebookToken(response.accessToken);
			handleNext();
		}
	};

	function getStepContent(step) {
		let isWeb3Active = typeof window.web3 !== 'undefined';
		let isWeb3Account = false;
		let web3NetworkVersion = false;
		if (isWeb3Active) {
			isWeb3Account = window.web3.eth.accounts.length > 0;
			web3NetworkVersion = window.ethereum.networkVersion === config.web3network;
		}
		switch (step) {
			case -1:
				return (
					<div className="o-container">
						<div className="o-box">
							<h1>Connect with</h1>
							<div className="Social__section">
								<GoogleLogin
									clientId="842312482762-n12g86otvipvmrbgscnur48m9aq8kf9l.apps.googleusercontent.com"
									className="google-button"
									buttonText="Google Account"
									onSuccess={responseGoogle}
									onFailure={responseGoogle}
									cookiePolicy={'single_host_origin'}
								/>
								<br></br>
								<FacebookLoginWithButton appId="278283846412876" callback={responseFacebook} icon="fa-facebook" />
							</div>
						</div>
					</div>
				);
			case 0:
				return (
					<div className="o-container">
						<div className="o-box">
							<svg
								width="234px"
								height="260px"
								viewBox="0 0 234 260"
								version="1.1"
								className="Logo"
								xmlns="http://www.w3.org/2000/svg"
								xmlnsXlink="http://www.w3.org/1999/xlink"
							>
								<title>Group</title>
								<desc>Created with Sketch.</desc>
								<defs>
									<linearGradient
										x1="25.3511512%"
										y1="49.9738242%"
										x2="107.245785%"
										y2="49.9738242%"
										id="linearGradient-1"
									>
										<stop stopColor="#6B32C1" offset="0%"></stop>
										<stop stopColor="#C81D5E" offset="99.6%"></stop>
									</linearGradient>
									<linearGradient x1="0%" y1="49.997576%" x2="100.032735%" y2="49.997576%" id="linearGradient-2">
										<stop stopColor="#EC663C" offset="0%"></stop>
										<stop stopColor="#F9B426" offset="100%"></stop>
									</linearGradient>
									<linearGradient
										x1="52.9498211%"
										y1="9.77958549%"
										x2="46.413551%"
										y2="97.6215544%"
										id="linearGradient-3"
									>
										<stop stopColor="#0081DD" offset="0%"></stop>
										<stop stopColor="#0589E0" offset="18.55%"></stop>
										<stop stopColor="#11A0E9" offset="47.85%"></stop>
										<stop stopColor="#25C5F8" offset="84.03%"></stop>
										<stop stopColor="#2FD7FF" offset="99.72%"></stop>
									</linearGradient>
									<linearGradient
										x1="50.0693857%"
										y1="83.9637181%"
										x2="50.0693857%"
										y2="-0.0504747626%"
										id="linearGradient-4"
									>
										<stop stopColor="#4E4D4C" offset="0%"></stop>
										<stop stopColor="#5A5858" offset="12.43%"></stop>
										<stop stopColor="#747273" offset="46.61%"></stop>
										<stop stopColor="#848183" offset="76.91%"></stop>
										<stop stopColor="#8A8789" offset="100%"></stop>
									</linearGradient>
									<radialGradient
										cx="35.4086957%"
										cy="34.4852355%"
										fx="35.4086957%"
										fy="34.4852355%"
										r="66.2842391%"
										id="radialGradient-5"
									>
										<stop stopColor="#FFFFFF" offset="0%"></stop>
										<stop stopColor="#FDFDFC" stopOpacity="0.8589" offset="35.27%"></stop>
										<stop stopColor="#F6F6F2" stopOpacity="0.7424" offset="64.4%"></stop>
										<stop stopColor="#EAEBE0" stopOpacity="0.635" offset="91.26%"></stop>
										<stop stopColor="#E5E6D9" stopOpacity="0.6" offset="100%"></stop>
									</radialGradient>
									<linearGradient
										x1="21.2472955%"
										y1="18.1560041%"
										x2="81.1871703%"
										y2="81.6403727%"
										id="linearGradient-6"
									>
										<stop stopColor="#FFFFFF" offset="0%"></stop>
										<stop stopColor="#FFFFFF" stopOpacity="0.5" offset="99.99%"></stop>
									</linearGradient>
									<linearGradient
										x1="37.2050099%"
										y1="17.2946945%"
										x2="63.1259484%"
										y2="89.469351%"
										id="linearGradient-7"
									>
										<stop stopColor="#FFFFFF" offset="0%"></stop>
										<stop stopColor="#FFFFFF" stopOpacity="0.3" offset="99.99%"></stop>
									</linearGradient>
								</defs>
								<g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
									<g id="logo_ovr">
										<g id="Group">
											<path
												d="M228.9,48.9 C226,44.9 222,41.6 217.3,39.7 L182.3,25 L127.6,2.1 C124.2,0.7 120.6,0 117,0 L117,96.6 L117,163.6 L228.9,210.5 C232.2,205.9 234,200.4 234,194.5 L234,64.9 C234.1,59.1 232.2,53.5 228.9,48.9 Z"
												id="h_viola_1_"
												fill={`url(${window.location}#linearGradient-1`}
											></path>
											<path
												d="M106.5,2.1 L19.8,38.4 L16.8,39.7 C12,41.7 8.1,44.9 5.2,48.9 C1.9,53.5 0,59.1 0,64.9 L0,194.4 C0,200.3 1.9,205.8 5.1,210.4 L117,163.5 L117,96.5 L117,0 C113.4,0 109.8,0.7 106.5,2.1 Z"
												id="h_org_1_"
												fill={`url(${window.location}#linearGradient-2`}
											></path>
											<path
												d="M117,163.5 L5.1,210.4 C8,214.4 11.9,217.6 16.6,219.6 L88.7,250.3 L106.2,257.8 C109.6,259.3 113.3,260 116.9,260 C120.6,260 124.2,259.3 127.6,257.8 L139.8,252.6 L217.2,219.6 C221.9,217.6 225.9,214.4 228.7,210.4 L117,163.5 Z"
												id="h_blu_1_"
												fill={`url(${window.location}#linearGradient-3`}
											></path>
											<path
												d="M198.7,67.6 C196.6,64.5 193.7,62 190.2,60.5 L164.7,49.2 L124.8,31.6 C122.3,30.5 119.7,30 117.1,30 C114.5,30 111.8,30.5 109.4,31.6 L46.1,59.5 L43.9,60.5 C40.4,62 37.5,64.5 35.4,67.6 C33,71.1 31.6,75.4 31.6,79.9 L31.6,179.6 C31.6,184.1 33,188.4 35.3,191.9 C37.4,195 40.3,197.5 43.7,199 L96.3,222.6 L109.1,228.4 C111.6,229.5 114.3,230.1 116.9,230.1 C119.5,230.1 122.2,229.5 124.7,228.4 L133.6,224.4 L190.1,199 C193.5,197.5 196.4,195 198.5,191.9 C200.9,188.4 202.2,184.1 202.2,179.6 L202.2,79.9 C202.5,75.4 201.1,71.1 198.7,67.6 Z"
												id="h_hex-trasp_1_"
												fill={`url(${window.location}#linearGradient-4`}
												opacity="0.45"
												style={{ mixBlendMode: 'color-burn' }}
											></path>
											<circle
												id="h_sphere_1_"
												fill={`url(${window.location}#radialGradient-5)`}
												cx="117"
												cy="129.6"
												r="55.2"
											></circle>
											<path
												d="M217.3,39.7 L182.3,25 L127.6,2.1 C124.2,0.7 120.6,0 117,0 C113.4,0 109.8,0.7 106.4,2.1 L19.8,38.4 L16.8,39.7 C12,41.7 8.1,44.9 5.2,48.9 L117,96.6 L228.9,49 C226,44.9 222,41.7 217.3,39.7 Z"
												id="h_top_1_"
												fill={`url(${window.location}#linearGradient-6`}
												opacity="0.76"
												style={{ mixBlendMode: 'soft-light' }}
											></path>
											<path
												d="M228.9,48.9 L117,96.6 L117,163.6 L117,260 C120.7,260 124.3,259.3 127.7,257.8 L139.9,252.6 L217.3,219.6 C222,217.6 226,214.4 228.8,210.4 C232.1,205.8 233.9,200.3 233.9,194.4 L233.9,64.9 C234.1,59.1 232.2,53.5 228.9,48.9 Z"
												id="h_left_1_"
												fill={`url(${window.location}#linearGradient-7`}
												style={{ mixBlendMode: 'soft-light' }}
											></path>
										</g>
									</g>
								</g>
							</svg>
							<h2>Join OVR, the decentralized infrastructure for the spatial web.</h2>
							<div className="Signup__section">
								OVR merges physical and virtual world through Augmented Reality, creating a new dimension. <br></br>{' '}
								<div className="p-tiny-message">
									We are starting the public sale the 16th of November. To access the whitelist you can register and
									pass the identity verification in your profile.
								</div>
							</div>
							<div className="Signup__section">
								<HexButton url="#" text="Get started" className={'--purple'} onClick={handleNext}></HexButton>
							</div>
						</div>
					</div>
				);
			case 1:
				return (
					<div className="o-container">
						<div className="o-box">
							<h1>First things first</h1>
							<div className="Signup__section --left">
								{isWeb3Active ? (
									<div className="o-list">
										<CheckCircleSharpIcon className="CheckCircleSharpIcon" /> Install Web3 provider
									</div>
								) : (
									<div className="o-list">
										<CancelIcon className="CancelIcon" /> Install Web3 provider
									</div>
								)}
								{isWeb3Account ? (
									<div className="o-list">
										<CheckCircleSharpIcon className="CheckCircleSharpIcon" /> Log in to Web3 provider
									</div>
								) : (
									<div className="o-list">
										<CancelIcon className="CancelIcon" /> Log in to Web3 provider
									</div>
								)}
								{web3NetworkVersion ? (
									<div className="o-list">
										<CheckCircleSharpIcon className="CheckCircleSharpIcon" /> Connect to{' '}
										{config.web3network === '3' ? 'Ropsten' : 'Mainnet'} network
									</div>
								) : (
									<div className="o-list">
										<CancelIcon className="CancelIcon" /> Connect to{' '}
										{config.web3network === '3' ? 'Ropsten' : 'Mainnet'} network
									</div>
								)}
							</div>
							<div className="ignore-this">
								For debug only, ignore this:
								{isWeb3Active.toString()}
								<br></br>
								{web3NetworkVersion.toString()}
								<br></br>
								{isWeb3Account.toString()}
								<br></br>
								{typeof window.web3}
								<br></br>
							</div>
							{isWeb3Active && web3NetworkVersion && isWeb3Account ? (
								<>
									<div className="Signup__section Signup__msg --positive">Hurray! Click below to continue.</div>
									<div className="Signup__section">
										<HexButton url="#" text="Continue" className={'--purple'} onClick={handleNext}></HexButton>
									</div>
								</>
							) : (
								<>
									<div className="Signup__section Signup__msg --negative">
										Please install MetaMask and configure it on the correct network. Than reload this page.
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
							;
						</div>
					</div>
				);
			case 2:
				return (
					<div className="o-container">
						<div className="o-box ">
							<h1>Create an account</h1>
							<div className="Social__section Social__subtitle">
								Sign up with your social media account or email address
							</div>
							<div className="Social__section Social__buttons">
								<GoogleLogin
									clientId="842312482762-n12g86otvipvmrbgscnur48m9aq8kf9l.apps.googleusercontent.com"
									buttonText="Google"
									onSuccess={responseGoogle}
									onFailure={responseGoogle}
									cookiePolicy={'single_host_origin'}
								/>
								<FacebookLoginWithButton appId="278283846412876" callback={responseFacebook} icon="fa-facebook" />
							</div>
							<div className="Social__section Social__or">or</div>
							<div className="Signup__section">
								<TextField
									id="quantity"
									label="Email address"
									type="email"
									className="Signup__email_textfield"
									error={userEmailInputError !== false ? true : false}
									helperText={userEmailInputError !== false ? userEmailInputError : ''}
									value={userEmail}
									onFocus={updateUserEmail}
									onChange={updateUserEmail}
									onKeyUp={updateUserEmail}
								/>
							</div>
							<div className="Signup__section --small">
								Account info are stored privately off the blockchain.
								{/* <Link to="#">Read more</Link>. */}
							</div>
							<div className="Signup__section">
								<HexButton
									url="#"
									text="Continue"
									className={`--purple ${userEmailValid ? '' : '--disabled'}`}
									onClick={emailRegexAndNext}
								></HexButton>
								{isSignupLoading && <CircularProgress />}
							</div>
						</div>
					</div>
				);
			case 3:
				return (
					<div className="o-container">
						<div className="o-box --left">
							<h1>Set Username</h1>
							<div className="Signup__section">
								<TextField
									id="quantity"
									label="Username"
									type="text"
									className="Signup__userpass_textfield"
									error={usernameInputError !== false ? true : false}
									helperText={usernameInputError !== false ? usernameInputError : ''}
									value={username}
									onFocus={updateUsername}
									onChange={updateUsername}
									onKeyUp={updateUsername}
								/>
							</div>
							{/* <div className="Signup__section Signup__pass_cont">
								<TextField
									id="quantity"
									label="Password"
									type="password"
									className="Signup__userpass_textfield"
									error={usernameInputError !== false ? true : false}
									helperText={usernameInputError !== false ? usernameInputError : ''}
									value={username}
									onFocus={updateUsername}
									onChange={updateUsername}
									onKeyUp={updateUsername}
								/>
							</div> */}
							<div className="Signup__section --small">
								Account info are stored privately off the blockchain.
								{/* <Link to="#">Read more</Link>. */}
							</div>
							<div className="Signup__section">
								<HexButton
									url="#"
									text="Signup"
									className={`--purple ${isSignupLoading || usernameValid ? '' : '--disabled'}`}
									onClick={handleSubscribe}
								></HexButton>
								{isSignupLoading && <CircularProgress />}
							</div>
						</div>
					</div>
				);
			case 4:
				return (
					<div className="o-container">
						<div className="o-box">
							<h1>Signup completed</h1>
							<div className="Signup__section">
								<CheckCircleIcon className="CheckCircleIcon" />
							</div>
							<div className="Signup__section">
								You've succesfully registered your account. From now on you can log in with Metamask by signing a secret
								code with one click.
							</div>
							{/* <div className="Signup__section Signup__pass_cont">
								<TextField
									id="quantity"
									label="Password"
									type="password"
									className="Signup__userpass_textfield"
									error={usernameInputError !== false ? true : false}
									helperText={usernameInputError !== false ? usernameInputError : ''}
									value={username}
									onFocus={updateUsername}
									onChange={updateUsername}
									onKeyUp={updateUsername}
								/>
							</div> */}
							<div className="Signup__section --small">
								Account info are stored privately off the blockchain.
								{/* <Link to="#">Read more</Link>. */}
							</div>
							<div className="Signup__section">
								<HexButton url="#" text="Log me in" className="--purple" onClick={handleLogin}></HexButton>
							</div>
						</div>
					</div>
				);
			default:
				return 'Unknown step';
		}
	}
	//
	// Return
	//

	return <div className="Signup">{getStepContent(activeStep)}</div>;
};

export default withWeb3Context(Signup);
