import React, { useContext, useEffect, useState } from 'react';
import * as moment from 'moment';

import { UserContext } from '../../context/UserContext';
// import HexImage from '../../components/HexImage/HexImage';
import HexButton from '../../components/HexButton/HexButton';
import config from '../../lib/config';
// import CheckBox from '../../components/CheckBox/CheckBox';
// import EmailConfirmation from '../../components/EmailConfirmation/EmailConfirmation';
// import IdensicComp from '../../components/IdensicComp/IdensicComp';
import { getSumsubData, setSumsubVerificationToStarted } from '../../lib/api';
import Blockies from 'react-blockies';

import ValueCounter from '../../components/ValueCounter/ValueCounter';
import { Web3Context } from '../../context/Web3Context';

import snsWebSdk from '@sumsub/websdk';
import { useTranslation, Translation} from 'react-i18next';

import { warningNotification } from '../../lib/notifications';



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
	)	
};

const ProfileLayout = () => {
	const { t, i18n } = useTranslation();
	const currentDatetimeStamp = moment().format('HH:mm, dddd, MMM D, YYYY');
	const { state: userState } = useContext(UserContext);
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
							seed={userState.user.uuid || 'loading'}
							size={12}
							scale={13}
							color="#7521c8"
							bgColor="#EC663C"
							spotColor="#F9B426"
						/>
					</div>
					<ProfileContent t={t} />
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
	let sumsubLang = localStorage.getItem('i18nextLng');
	let userWallet;
	if (window.web3 && window.web3.eth && window.web3.eth.defaultAccount && window.web3.eth.defaultAccount.toLowerCase()){
		userWallet = window.web3.eth.defaultAccount.toLowerCase();
	}
	if (userWallet){
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
				metadata: [{"key": "walletAddress", "value": userWallet}],
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

const countdownTimer = (t) => {
	const difference = +new Date("2020-11-30") - +new Date();
	let custom_return = '';

	if (difference > 0) {
		const parts = {
			days: Math.floor(difference / (1000 * 60 * 60 * 24)),
			hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
			minutes: Math.floor((difference / 1000 / 60) % 60),
			seconds: Math.floor((difference / 1000) % 60),
		};
		
		custom_return =
		t('Profile.ovr.sale.start')+' ' +
			parts.days +
			' '+t('Profile.days')+' ' +
			parts.hours +
			' '+t('Profile.hours')+' ' +
			parts.minutes +
			' '+t('Profile.mins')+' ' +
			parts.seconds + ' '+t('Profile.secs')+'.';
	}
	return custom_return;
};
const ProfileContent = () => {
	const { t, i18n } = useTranslation();
	const { state: userState } = useContext(UserContext);
	const web3Context = useContext(Web3Context);
	const [sumsubShowPanel, setSumsubShowPanel] = useState(false);

	const { user } = userState;
	// console.log('ProfileContent->These are user and web3Context from UserContext', web3Context, user);
	useEffect(() => {
		if (sumsubShowPanel == true && user.uuid != undefined) {
			getSumsubData()
				.then((response) => {
					// console.log(response);
					if (response.data.result === true) {
						// console.log(user.email);
						launchWebSdk(config.apis.sumsubApi, 'basic-kyc', response.data.content.token, user.email, null, t);
						// 	externalUserId={sumsubExternalUserId}
						// 	accessToken={sumsubAccessToken}
					}
				})
				.catch((error) => {
					// Notify user if network error
					// console.log(error);
				});
			if (user.kycReviewAnswer == -1) {
				setSumsubVerificationToStarted()
					.then(() => {})
					.catch(() => {});
			}
		}
	}, [user.uuid, sumsubShowPanel, localStorage.getItem('i18nextLng')]);

	const toggleKycVerificationFrame = (e) => {
		e.preventDefault();
		setSumsubShowPanel(!sumsubShowPanel);
	};

	return (
		<div className="profile-content">
			<div key="wallet" className="p-section">
				<h3 className="p-section-title">{t('Profile.wallet.info')}</h3>
				<div className="p-section-content">
					<h4 className="p-content-title">{t('Profile.wallet.addr')}</h4>
					<div className="p-wallet-address">
						{window.web3 &&
							window.web3.eth &&
							window.web3.eth.defaultAccount &&
							window.web3.eth.defaultAccount.toLowerCase()}
					</div>
					<div className="p-balance">
						<div className="p-small-title">{t('Profile.balance')}</div>
						<div className="p-balance-value">
							<ValueCounter value={web3Context.state.ovrsOwned} />
							<div>
								<HexButton url="/buy-tokens" className="--orange --disabled" text={t('Profile.buy.ovr')}></HexButton>
								{/* history.push('/profile');
								// TODO: KYC -  */}
							</div>
						</div>
					</div>
				</div>
				<div key="KYC" className="p-section --m-t">
					<h3 className="p-section-title">{t('Profile.identify.verification')}</h3>
					<div className="p-tiny-message">
						{countdownTimer(t)} <br></br>
						{user.kycReviewAnswer == 1
							? t('Profile.whitelisted.ok')
							: t('Profile.whitelisted.no.ok')}
						<br></br>
						<br></br>
					</div>
					<div className="p-section-content">
						<h4 className="p-content-title">{t('Profile.status.label')}</h4>
						<div className="p-balance-value">
							{renderBadge(user.kycReviewAnswer, t)}
							<div>
								<HexButton
									url=""
									className="--blue"
									text={user.kycReviewAnswer == -1 ? t('Profile.start.verification') : t('Profile.check.verification')}
									onClick={toggleKycVerificationFrame}
								></HexButton>
							</div>
						</div>
					</div>
					<div className="p-tiny-message">
						{user.kycClientComment != null && user.kycReviewAnswer != 1 && user.kycClientComment}
					</div>
					<div id="sumsub-websdk-container"></div>
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
	);
};

const Profile = () => {
	const { t, i18n } = useTranslation();
	const { state } = useContext(UserContext);
	const { isLoggedIn: userAuthenticated } = state;

	if (!userAuthenticated) {
		return <ProfileContentLoginRequired t={t}/>;
	}
	return <ProfileLayout state={state}/>;
};

export default Profile;
