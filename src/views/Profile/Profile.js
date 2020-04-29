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

const ProfileContent = (user) => {
	console.log('ProfileContent shows the user info', user);

	const currentDatetimeStamp = moment().format('HH:mm, dddd, MMM D, YYYY');
	return (
		<div className="profile">
			<div className="p-header">
				<h2 className="p-header-title">My Profile</h2>
				<span className="p-header-datetime">{currentDatetimeStamp}</span>
			</div>
			<div className="p-container">
				<div className="o-fourth">Aqui va un hexagono</div>
				<div className="">Aqui va el resto</div>
			</div>
		</div>
	);
};

const Profile = () => {
	const { state, actions } = useContext(UserContext);
	const { isLoggedIn: userAuthenticated, user } = state;

	if (!userAuthenticated) {
		return <ProfileContentLoginRequired />;
	}
	console.log('These are the actions for UserContext', actions);

	return <ProfileContent user={user} />;
};

export default Profile;
