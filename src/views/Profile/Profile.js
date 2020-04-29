import React, { useContext } from 'react';

import { UserContext } from '../../context/UserContext';
import * as moment from 'moment';

// import { networkError } from '../../lib/notifications';

const ProfileContentLoginRequired = () => (
	<div className="Profile">
		<div className="p-container">
			<div className="c-dialog --centered">
				<div className="c-dialog-main-title">You have to log in to visit Your profile 😎</div>
				<div className="c-dialog-sub-title">Check your profile. Login now.</div>
			</div>
		</div>
	</div>
);

const ProfileLayout = () => {
	const currentDatetimeStamp = moment().format('HH:mm, dddd, MMM D, YYYY');
	return (
		<div className="profile">
			<div className="p-header">
				<h2 className="p-header-title">My Profile</h2>
				<span className="p-header-datetime">{currentDatetimeStamp}</span>
			</div>
			<div className="p-container">
				<div className="o-fourth">Aqui va un hexagono</div>
				<div className="">
					<ProfileContent />
				</div>
			</div>
		</div>
	);
};

const ProfileContent = () => {
	const { state, actions } = useContext(UserContext);
	const { user } = state;
	console.log('ProfileContent->These are user and actions from UserContext', actions, user);

	return [
		<div key="wallet" className="p-section">
			<div className="p-section-title">WALLET</div>
			<div className="p-section-content">
				<div className="p-content-title">Wallet address</div>
				<div className="p-balance">SHOW THE BALANCE with TWO BUTTONS</div>
			</div>
		</div>,
		<div key="authorizations" className="p-section">
			<div className="p-section-title">AUTHORIZATIONS</div>
			<div className="p-section-content">
				<div className="o-half">
					<div className="p-content-title">For Buying</div>
					<div className="p-checkbox-item">
						[] ERC721 using OVR
						<small>Authorize the Marketplace to operate OVR on my behalf</small>
					</div>
					<div className="p-checkbox-item">
						[] ERC721 using OVR
						<small>Authorize the Marketplace to operate OVR on my behalf</small>
					</div>
					<div className="p-checkbox-item">
						[] ERC721 using OVR
						<small>Authorize the Marketplace to operate OVR on my behalf</small>
					</div>
				</div>
				<div className="o-half">
					<div className="p-content-title">For Selling</div>
					<div className="p-checkbox-item">
						[] ERC721 using OVR
						<small>Authorize the Marketplace to operate OVR on my behalf</small>
					</div>
					<div className="p-checkbox-item">
						[] ERC721 using OVR
						<small>Authorize the Marketplace to operate OVR on my behalf</small>
					</div>
					<div className="p-checkbox-item">
						[] ERC721 using OVR
						<small>Authorize the Marketplace to operate OVR on my behalf</small>
					</div>
				</div>
			</div>
		</div>,
		<div key="notifications" className="p-section">
			<div className="p-section-title">NOTIFICATIONS</div>
			<div className="p-section-content">
				<div className="p-content-title">General</div>
				<div>
					<div className="o-half">
						<div className="p-checkbox-item">
							[] Hottest Auctions
							<small>Authorize the Marketplace to operate OVR on my behalf</small>
						</div>
					</div>
					<div className="o-half">
						<div className="p-checkbox-item">
							[] Area of interest
							<small>Authorize the Marketplace to operate OVR on my behalf</small>
						</div>
					</div>
				</div>
				<div>
					<div className="o-half">
						<div className="p-content-title">My OVRLands</div>
						<div className="p-checkbox-item">
							[] New sell request
							<small>Authorize the Marketplace to operate OVR on my behalf</small>
						</div>
						<div className="p-checkbox-item">
							[] OVRLand sold
							<small>Authorize the Marketplace to operate OVR on my behalf</small>
						</div>
					</div>
					<div className="o-half">
						<div className="p-content-title">My auctions</div>
						<div className="p-checkbox-item">
							[] Over bidded
							<small>Authorize the Marketplace to operate OVR on my behalf</small>
						</div>
						<div className="p-checkbox-item">
							[] Auction won
							<small>Authorize the Marketplace to operate OVR on my behalf</small>
						</div>
					</div>
				</div>

				<div className="p-email-subscription">
					[] Active email notification
					<label>
						Your email
						<input type="text"></input>
					</label>
					<small>
						We will keep this information for ourselves, as it will not be written on the blockchain. By inserting your
						email address you accept our Terms and Conditions
					</small>
				</div>
			</div>
		</div>,
	];
};

const Profile = () => {
	const { state, actions } = useContext(UserContext);
	const { isLoggedIn: userAuthenticated } = state;

	if (!userAuthenticated) {
		return <ProfileContentLoginRequired />;
	}
	console.log('These are the actions for UserContext', actions);

	return <ProfileLayout />;
};

export default Profile;
