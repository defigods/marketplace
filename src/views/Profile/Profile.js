import React, { useContext, useEffect, useState } from 'react';
import * as moment from 'moment';

import TextField from '@material-ui/core/TextField';
import { UserContext } from '../../context/UserContext';
// import HexImage from '../../components/HexImage/HexImage';
import HexButton from '../../components/HexButton/HexButton';
import config from '../../lib/config';
// import {isiOS, isImToken} from '../../lib/config';
// import CheckBox from '../../components/CheckBox/CheckBox';
// import EmailConfirmation from '../../components/EmailConfirmation/EmailConfirmation';
// import IdensicComp from '../../components/IdensicComp/IdensicComp';
import { getSumsubData, setSumsubVerificationToStarted, setDbUserEmail, getSumsubExternalLink } from '../../lib/api';
import { successNotification, warningNotification } from '../../lib/notifications';

import Blockies from 'react-blockies';

import ValueCounter from '../../components/ValueCounter/ValueCounter';
import { Web3Context } from '../../context/Web3Context';

import snsWebSdk from '@sumsub/websdk';
import { useTranslation, Translation } from 'react-i18next';

import Tooltip from '@material-ui/core/Tooltip';
import Help from '@material-ui/icons/Help';

import CircularProgress from '@material-ui/core/CircularProgress';
import i18n from 'i18next';
import { getCurrentLocale } from '../../i18n';

import ReactGA from 'react-ga';
let isMobile = window.innerWidth < 860;

const ProfileContentLoginRequired = () => {
	const { t, i18n } = useTranslation();
	return (
		<div className="profile">
			<div className="o-container">
				<div className="c-dialog --centered">
					<div className="c-dialog-main-title">
						{t('Profile.login.required')}
						<span role="img" aria-label="Cool dude">
							😎
						</span>
					</div>
					<div className="c-dialog-sub-title">{t('Profile.check.profile')}</div>
				</div>
			</div>
		</div>
	);
};

const ProfileLayout = () => {
	const { t, i18n } = useTranslation();
	const currentDatetimeStamp = moment().format('HH:mm, dddd, MMM D, YYYY');
	const userContext = useContext(UserContext);
	const web3Context = useContext(Web3Context);
	const user = userContext.state.user;
	const [balance, setBalance] = React.useState(user.balance);
	const [allowance, setAllowance] = React.useState(user.allowance);
	const [address, setAddress] = React.useState(user.publicAddress);
	const { refreshBalanceAndAllowance } = userContext.actions;
	const { authorizeOvrExpense } = web3Context.actions;
	const { MerkleDistributorSigner, MerkleDistributorViewer, address: userAddress } = web3Context.state;

	const [sumsubShowPanel, setSumsubShowPanel] = useState(false);
	const [userEmailValid, setUserEmailValid] = useState(false);
	const [userEmailInputError, setUserEmailInputError] = useState(false);
	const [userEmail, setUserEmail] = useState('');
	const [urlKyc, setUrlKyc] = useState('#');
	const [isSignupLoading, setIsSignupLoading] = useState(false);
	const [isIMWallet, setIsIMWallet] = useState(false);
	const [hasMounted, setHasMounted] = useState(false);

	const [isClaimed, setClaimed] = useState(true);
	const [claimInfo, setClaimInfo] = useState(null);

	React.useEffect(() => {
		if (user != undefined && user.balance != undefined) {
			setBalance(user.balance.toFixed(2));
		}
	}, [user.balance]);

	React.useEffect(() => {
		if (user != undefined && user.allowance != undefined) {
			setAllowance(user.allowance.toFixed(0));
		}
	}, [user.allowance]);

	React.useEffect(() => {
		setAddress(user.publicAddress);
	}, [user.publicAddress]);

	// Sumsub and ImWallet
	React.useEffect(() => {
		// IMWallet workaround
		if (isMobile == true) {
			if (window.ethereum) {
				setIsIMWallet(true);
				if (user.uuid != undefined) {
					let sumsubLang = 'en';
					if (getCurrentLocale().includes('zh')) {
						sumsubLang = 'zh';
					}
					getSumsubExternalLink(sumsubLang)
						.then((response) => {
							if (response.data.result === true) {
								setUrlKyc(response.data.url);
							}
						})
						.catch(() => {});
				}
			}
		}
		// Sumsub reload of webview
		if (sumsubShowPanel == true && user.uuid != undefined) {
			getSumsubData()
				.then((response) => {
					if (response.data.result === true) {
						launchWebSdk(config.apis.sumsubApi, 'basic-kyc', response.data.content.token, user.email, null, t);
					}
				})
				.catch((error) => {});
			if (user.kycReviewAnswer == -1) {
				setSumsubVerificationToStarted()
					.then(() => {})
					.catch(() => {});
			}
		}
	}, [user, sumsubShowPanel, localStorage.getItem('i18nextLng')]);

	// Cashback
	React.useEffect(() => {
		const checkIsClaimed = async (index) => {
			if (MerkleDistributorViewer) {
				const isClaimed = await MerkleDistributorViewer.isClaimed(index);
				setClaimed(isClaimed);
			}
		};

		console.log('userAddress', userAddress);

		if (!userAddress) {
			setClaimInfo(null);
		} else {
			const userClaimIndex = Object.keys(config.apis.merkleInfo.claims).findIndex(
				(el) => el.toLocaleLowerCase() === userAddress.toLocaleLowerCase(),
			);

			console.log('userClaimIndex', userClaimIndex);

			if (userClaimIndex >= 0) {
				const claimInfo = config.apis.merkleInfo.claims[Object.keys(config.apis.merkleInfo.claims)[userClaimIndex]];
				setClaimInfo(claimInfo);
				checkIsClaimed(claimInfo.index);
			}
		}
	}, [userAddress, MerkleDistributorViewer]);

	const toggleKycVerificationFrame = (e) => {
		e.preventDefault();
		if (user.email) {
			setSumsubShowPanel(!sumsubShowPanel);
			ReactGA.set({ page: window.location.pathname + '/kyc-started' });
			ReactGA.pageview(window.location.pathname + '/kyc-started');
		} else {
			warningNotification(t('Warning.email.not.detected.title'), t('Warning.email.not.detected.desc'));
		}
	};

	const toggleImWalletKycVerificationFrame = (e) => {
		if (user.email) {
		} else {
			e.preventDefault();
			warningNotification(t('Warning.email.not.detected.title'), t('Warning.email.not.detected.desc'));
		}
	};

	const updateUserEmail = (e) => {
		if (userEmail === '') {
			setUserEmailValid(false);
		} else {
			setUserEmailValid(true);
		}
		setUserEmail(e.target.value);
	};

	const handleAddEmail = (e) => {
		if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail)) {
			setIsSignupLoading(true);
			setUserEmailInputError(false);
			setDbUserEmail(userEmail)
				.then((response) => {
					if (response.data.result === true) {
						userContext.actions.setUserEmail(userEmail);
						successNotification(t('Generic.congrats.label'), t('Signup.email.saved.title'));
						ReactGA.set({ page: window.location.pathname + '/email-saved' });
						ReactGA.pageview(window.location.pathname + '/email-saved');
						window.gtag_report_email_inserted_conversion();
					} else {
						let error_message = response.data.errors[0].message;
						setIsSignupLoading(false);
						setUserEmailValid(false);
						setUserEmailInputError(error_message);
					}
				})
				.catch((error) => {});
		} else {
			setUserEmailInputError(t('Signup.email.not.valid'));
			setUserEmailValid(false);
		}
	};

	const handleClaimCashback = async (e) => {
		if (!claimInfo || isClaimed) {
			warningNotification(t('Profile.cashback.error.title'), t('Profile.cashback.error.desc'));
			return;
		}

		try {
			await MerkleDistributorSigner.claim(claimInfo.index, userAddress, claimInfo.amount, claimInfo.proof);
			successNotification(t('Success.action.title'), t('Success.request.process.desc'));
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="profile">
			<div className="o-container">
				<div className="p-header">
					<h2 className="p-header-title">{t('Profile.my.profile')}</h2>
					<span className="p-header-datetime">{currentDatetimeStamp}</span>
				</div>
				<div className="p-body">
					<div className="o-fourth">
						{/* <HexImage className="profile-image" /> */}
						<Blockies
							seed={user.publicAddress || 'loading'}
							size={12}
							scale={13}
							color="#7521c8"
							bgColor="#EC663C"
							spotColor="#F9B426"
						/>
					</div>
					<div className="profile-content">
						<div key="wallet" className="p-section">
							<h3 className="p-section-title">{t('Profile.wallet.info')}</h3>
							<div className="p-section-content">
								<h4 className="p-content-title">{t('Profile.wallet.addr')}</h4>
								<div className="p-wallet-address">{address}</div>
								<div className="p-balance">
									<div className="p-small-title">{t('Profile.balance')}</div>
									<div className="p-balance-value">
										<ValueCounter value={balance} />
										<div>
											<HexButton url="/public-sale" className={'--orange '} text={t('Profile.buy.ovr')}></HexButton>
											{/* history.push('/profile');
											// TODO: KYC -  */}
										</div>
									</div>
								</div>
								<div className="p-balance">
									<div className="p-small-title">
										{t('Auctions.allowance')}
										<Tooltip
											title={<React.Fragment>{t('Aucitons.allowance.tooltip')}</React.Fragment>}
											aria-label="info"
											placement="bottom"
										>
											<Help className="Help" />
										</Tooltip>
									</div>
									<div className="p-balance-value">
										<ValueCounter value={allowance} />
										<div>
											<HexButton
												url="#"
												onClick={async (e) => {
													e.preventDefault();
													await authorizeOvrExpense('10000000');
													setTimeout(() => {
														refreshBalanceAndAllowance();
													}, 20000);
												}}
												className={'--orange '}
												text={t('Auctions.allowance.increment')}
											></HexButton>
											{/* history.push('/profile');
											// TODO: KYC -  */}
										</div>
									</div>
								</div>
							</div>
							<div key="KYC" className="p-section --m-t">
								<h3 className="p-section-title">{t('Profile.identify.verification')}</h3>
								<div className="p-tiny-message">
									<div className="p-tiny-message">
										{t('Profile.ovr.sale.started')}
										<br></br>
									</div>

									{user.kycReviewAnswer == 1 ? '' : t('Profile.whitelisted.no.ok')}
									<br></br>
									<br></br>
								</div>
								<div className="p-section-content">
									{user.email ? (
										<div className="p-balance-value">
											<TextField
												id="quantity"
												label="Email address"
												type="email"
												className="Signup__email_textfield"
												value={user.email}
												disabled
											/>
										</div>
									) : (
										<div className="p-balance-value">
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
											<div>
												{!isSignupLoading && (
													<HexButton
														url="#"
														className={`--blue ${userEmailValid ? '' : '--disabled'}`}
														text={t('Email.add')}
														onClick={handleAddEmail}
													></HexButton>
												)}
												{isSignupLoading && <CircularProgress />}
											</div>
										</div>
									)}
								</div>
								<br></br>
								<br></br>
								<br></br>
								<div className="p-section-content">
									<h4 className="p-content-title">{t('Profile.status.label')}</h4>
									{isIMWallet ? (
										<>
											<div className="p-tiny-message">{t('Profile.ios.sumsub')}</div>
											<br></br>
										</>
									) : (
										<></>
									)}

									<div className="p-balance-value">
										{renderBadge(user.kycReviewAnswer, t)}
										<div>
											{!isIMWallet ? (
												<HexButton
													url="#"
													className="--blue"
													text={
														user.kycReviewAnswer == -1
															? t('Profile.start.verification')
															: t('Profile.check.verification')
													}
													onClick={toggleKycVerificationFrame}
												></HexButton>
											) : (
												<HexButton
													target={'_blank'}
													url={urlKyc}
													className="--blue"
													text={t('Generic.external.link')}
													onClick={toggleImWalletKycVerificationFrame}
												></HexButton>
											)}
										</div>
									</div>
								</div>
								<div className="p-tiny-message">
									{user.kycClientComment != null && user.kycReviewAnswer != 1 && user.kycClientComment}
								</div>
								<div id="sumsub-websdk-container"></div>
							</div>
							<div key="Cashback" className="p-section --m-t">
								<h3 className="p-section-title">{t('Profile.cashback.title')}</h3>

								<div className="p-tiny-message">
									<div className="p-tiny-message">{t('Profile.cashback.description')}</div>
									<br></br>
									<br></br>
								</div>
								<div className="p-section-content">
									<HexButton
										url="#"
										className={'--orange'}
										text={t('Profile.cashback.button')}
										onClick={handleClaimCashback}
									></HexButton>
								</div>
							</div>
							<div className="p-tiny-message">
								{/* Every account will need to verify it's identity in order to buy OVR. <br></br>
								Start your verification now. */}
							</div>
							{/* <div key="redeem-land" className="p-section --m-t">
								<h3 className="p-section-title">Redeem lands</h3>
								<div className="p-section-content">
									<h4 className="p-content-title">Waiting to be redeemed</h4>
									<div className="p-balance-value">
										0
										<div>
											<HexButton
												url=""
												className="Funds__buy HexButton --blue redeem-button"
												text="Redeem lands"
												onClick={web3Context.redeemLands}
											></HexButton>
										</div>
									</div>
								</div>
							</div> */}
							{/*
								<div key="notifications" className="p-section">
									<h3 className="p-section-title">NOTIFICATIONS</h3>
									<div className="p-section-content">
										<h4 className="p-content-title">General</h4>
										<div>
											<div className="o-half">
												<CheckBox label="Hottest Auctions" text="Authorize the Marketplace to operate OVR on my behalf" />
											</div>
											<div className="o-half">
												<CheckBox label="Area of interest" text="Authorize the Marketplace to operate OVR on my behalf" />
											</div>
										</div>
										<div>
											<div className="o-half">
												<h4 className="p-content-title">My OVRLands</h4>
												<CheckBox label="New sell request" text="Authorize the Marketplace to operate OVR on my behalf" />
												<CheckBox label="OVRLand sold" text="Authorize the Marketplace to operate OVR on my behalf" />
											</div>
											<div className="o-half">
												<h4 className="p-content-title">My auctions</h4>
												<CheckBox label="Over bidded" text="Authorize the Marketplace to operate OVR on my behalf" />
												<CheckBox label="Auction won" text="Authorize the Marketplace to operate OVR on my behalf" />
											</div>
										</div>
									</div>

									<div className="p-email-subscription">
										<EmailConfirmation />
									</div>
								</div>
							*/}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const renderBadge = (status, t) => {
	let badge = <div>&nbsp;</div>;
	switch (status) {
		case -1:
			badge = <div className="c-status-badge  --open">{t('Profile.not.started')}</div>;
			break;
		case -10:
			badge = <div className="c-status-badge  --open">{t('Profile.started')}</div>;
			break;
		case 1:
			badge = <div className="c-status-badge  --open">{t('Profile.completed')}</div>;
			break;
		case 0:
			badge = <div className="c-status-badge  --open">{t('Profile.failed')}</div>;
			break;
		default:
			badge = <div>&nbsp;</div>;
	}
	return badge;
};

const launchWebSdk = (apiUrl, flowName, accessToken, applicantEmail, applicantPhone, t) => {
	let sumsubLang = 'en';
	if (getCurrentLocale().includes('zh')) {
		sumsubLang = 'zh';
	}
	let userWallet;
	if (
		window.web3 &&
		window.web3.eth &&
		window.web3.eth.defaultAccount &&
		window.web3.eth.defaultAccount.toLowerCase()
	) {
		userWallet = window.web3.eth.defaultAccount.toLowerCase();
	}
	if (userWallet) {
		let snsWebSdkInstance = snsWebSdk
			.Builder(apiUrl, flowName)
			.withAccessToken(accessToken, (newAccessTokenCallback) => {
				// Access token expired
				// get a new one and pass it to the callback to re-initiate the WebSDK
				let newAccessToken = '...'; // get a new token from your backend
				newAccessTokenCallback(newAccessToken);
			})
			.withConf({
				lang: sumsubLang,
				email: applicantEmail,
				phone: applicantPhone,
				metadata: [{ key: 'walletAddress', value: userWallet }],
				onMessage: (type, payload) => {
					console.log('WebSDK onMessage', type, payload);
				},
				customCss: 'url',
				onError: (error) => {
					console.error('WebSDK onError', error);
				},
			})
			.build();
		snsWebSdkInstance.launch('#sumsub-websdk-container');
	} else {
		warningNotification(t('Warning.metamask.not.detected.title'), t('Warning.metamask.not.detected.desc'));
	}
};

const Profile = () => {
	const { t, i18n } = useTranslation();
	const { state } = useContext(UserContext);
	const { isLoggedIn: userAuthenticated } = state;

	// Google Analytics
	useEffect(() => {
		let authenticated = '';
		if (userAuthenticated) {
			authenticated = '/authenticated';
		}
		ReactGA.set({ page: window.location.pathname + authenticated });
		ReactGA.pageview(window.location.pathname + authenticated);
	}, [userAuthenticated]);

	if (!userAuthenticated) {
		return <ProfileContentLoginRequired t={t} />;
	}

	return <ProfileLayout state={state} />;
};

export default Profile;
