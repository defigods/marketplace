import React, { useContext, useEffect, useState } from 'react';
import * as moment from 'moment';

import { UserContext } from '../../context/UserContext';
import HexImage from '../../components/HexImage/HexImage';
import HexButton from '../../components/HexButton/HexButton';
import CheckBox from '../../components/CheckBox/CheckBox';
import EmailConfirmation from '../../components/EmailConfirmation/EmailConfirmation';
import IdensicComp from '../../components/IdensicComp/IdensicComp';
import { getSumsubData } from '../../lib/api';
import Blockies from 'react-blockies';

import ValueCounter from '../../components/ValueCounter/ValueCounter';
// import { networkError } from '../../lib/notifications';

const ProfileContentLoginRequired = () => (
	<div className="profile">
		<div className="o-container">
			<div className="c-dialog --centered">
				<div className="c-dialog-main-title">
					You have to log in to visit Your profile
					<span role="img" aria-label="Cool dude">
						😎
					</span>
				</div>
				<div className="c-dialog-sub-title">Check your profile. Login now.</div>
			</div>
		</div>
	</div>
);

const ProfileLayout = (props) => {
	const currentDatetimeStamp = moment().format('HH:mm, dddd, MMM D, YYYY');
	return (
		<div className="profile">
			<div className="o-container">
				<div className="p-header">
					<h2 className="p-header-title">My Profile</h2>
					<span className="p-header-datetime">{currentDatetimeStamp}</span>
				</div>
				<div className="p-body">
					<div className="o-fourth">
						{/* <HexImage className="profile-image" /> */}
						<Blockies
							seed={props.state.user.uuid || 'wewewe'}
							size={12}
							scale={13}
							color="#7521c8"
							bgColor="#EC663C"
							spotColor="#F9B426"
						/>
					</div>
					<ProfileContent />
				</div>
			</div>
		</div>
	);
};

const renderBadge = (status) => {
	let badge = <div>&nbsp;</div>;
	switch (status) {
		case -1:
			badge = <div className="c-status-badge  --open">Not started</div>;
			break;
		case 0:
			badge = <div className="c-status-badge  --open">Started</div>;
			break;
		case 1:
			badge = <div className="c-status-badge  --open">Pending</div>;
			break;
		case 2:
			badge = <div className="c-status-badge  --open">Queued</div>;
			break;
		case 3:
			badge = <div className="c-status-badge  --open">Completed</div>;
			break;
		case 4:
			badge = <div className="c-status-badge  --open">On Hold</div>;
			break;
		default:
			badge = <div>&nbsp;</div>;
	}
	return badge;
};

const ProfileContent = () => {
	const { state, actions } = useContext(UserContext);
	const [sumsubShowPanel, setSumsubShowPanel] = useState(false);
	const [sumsubExternalUserId, setSumsubExternalUserId] = useState(0);
	const [sumsubAccessToken, setSumsubAccessToken] = useState(0);
	const { user } = state;
	// console.log('ProfileContent->These are user and actions from UserContext', actions, user);

	useEffect(() => {
		if (sumsubShowPanel == true && sumsubExternalUserId == 0 && user.uuid != undefined) {
			getSumsubData()
				.then((response) => {
					if (response.data.result === true) {
						setSumsubExternalUserId(user.uuid);
						setSumsubAccessToken(response.data.content.token);
					}
				})
				.catch((error) => {
					// Notify user if network error
					console.log(error);
				});
		}
	}, [user.uuid, sumsubShowPanel]);

	const toggleKycVerificationFrame = (e) => {
		console.log('clicchino')
		e.preventDefault();
		setSumsubShowPanel(!sumsubShowPanel);
	};

	return (
		<div className="profile-content">
			<div key="wallet" className="p-section">
				<h3 className="p-section-title">Wallet informations</h3>
				<div className="p-section-content">
					<h4 className="p-content-title">Wallet address</h4>
					<div className="p-wallet-address">
						{window.web3 &&
							window.web3.eth &&
							window.web3.eth.defaultAccount &&
							window.web3.eth.defaultAccount.toLowerCase()}
					</div>
					<div className="p-balance">
						<div className="p-small-title">Balance</div>
						<div className="p-balance-value">
							<ValueCounter value={state.ovrsOwned} />
							<div>
								<HexButton url="/buy-tokens" className="--orange" text="BUY MORE"></HexButton>
							</div>
						</div>
					</div>
				</div>
				<div key="KYC" className="p-section --m-t">
					<h3 className="p-section-title">Identity verification</h3>
					<div className="p-section-content">
						<h4 className="p-content-title">Status</h4>
						<div className="p-balance-value">
							{renderBadge(user.kycReviewStatus)}
							<div>
								<HexButton
									url=""
									className="--blue"
									text="START VERIFICATION"
									onClick={toggleKycVerificationFrame}
								></HexButton>
							</div>
						</div>
					</div>
					{sumsubExternalUserId != 0 && (
						<IdensicComp
							baseUrl="https://test-api.sumsub.com"
							externalUserId={sumsubExternalUserId}
							accessToken={sumsubAccessToken}
						/>
					)}
				</div>
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
	const { state } = useContext(UserContext);
	const { isLoggedIn: userAuthenticated } = state;

	if (!userAuthenticated) {
		return <ProfileContentLoginRequired />;
	}
	return <ProfileLayout state={state} />;
};

export default Profile;
