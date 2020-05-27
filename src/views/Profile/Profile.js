import React, { useContext } from 'react';
import * as moment from 'moment';

import { UserContext } from '../../context/UserContext';
import HexImage from '../../components/HexImage/HexImage';
import HexButton from '../../components/HexButton/HexButton';
import CheckBox from '../../components/CheckBox/CheckBox';
import EmailConfirmation from '../../components/EmailConfirmation/EmailConfirmation';

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

const ProfileLayout = () => {
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
						<HexImage className="profile-image" />
					</div>
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

	return (
		<div className="profile-content">
			<div key="wallet" className="p-section">
				<h3 className="p-section-title">WALLET</h3>
				<div className="p-section-content">
					<h4 className="p-content-title">Wallet address</h4>
					<div className="p-wallet-address">0xe9c117536f07ec74af259560c548ccd7d21f89eb</div>
					<div className="p-balance">
						<div>Balance</div>
						<div className="p-balance-value">
							<ValueCounter value={state.ovrsOwned} />
							<div>
								<HexButton url="/buy-tokens" className="--orange" text="BUY MORE"></HexButton>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
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
