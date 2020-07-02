import React, { useContext, useEffect, useState } from 'react';
import * as moment from 'moment';

import { UserContext } from '../../context/UserContext';
import { Web3Context } from '../../context/Web3Context';
import ActivityTile from '../../components/ActivityTile/ActivityTile';

const ActivityContentLoginRequired = () => (
	<div className="profile">
		<div className="o-container">
			<div className="c-dialog --centered">
				<div className="c-dialog-main-title">
					You have to log in to visit Your Activity
					<span role="img" aria-label="Cool dude">
						😎
					</span>
				</div>
				<div className="c-dialog-sub-title">Check your profile. Login now.</div>
			</div>
		</div>
	</div>
);

const ActivityLayout = () => {
	const currentDatetimeStamp = moment().format('HH:mm, dddd, MMM D, YYYY');
	return (
		<div className="activity">
			<div className="o-container">
				<div className="p-header">
					<h2 className="p-header-title">Activity</h2>
					<span className="p-header-datetime">{currentDatetimeStamp}</span>
				</div>
				<div className="sub-title">
					Here's a list of your transactions. You can view the details on Etherscan to keep track of what's happening!
				</div>
			</div>
			<ActivityContent></ActivityContent>
		</div>
	);
};

const ActivityContent = () => {
	const { state: userState } = useContext(UserContext);
	const [activityList, setActivityList] = useState(false);
	const web3Context = useContext(Web3Context);
	const { user } = userState;

	useEffect(() => {
		if (userState.user.activities && userState.user.activities.content) {
			let activities = [];
			activities = userState.user.activities.content.map((obj) => (
				<ActivityTile
					key={obj.uuid}
					data={obj}
					context={{
						userState: user,
						web3Context: web3Context,
					}}
				></ActivityTile>
			));
			console.log('activities', activities);
			if (activities.length === 0) {
				console.log('vodo');
				activities = (
					<div className="profile">
						<div className="o-container">
							<div className="c-dialog --centered">
								<div className="c-dialog-sub-title">
									You have no past Activity, start now using the Marketplace
									<span role="img" aria-label="Cool dude">
										🤙
									</span>
								</div>
							</div>
						</div>
					</div>
				);
			}
			// return activities;
			setActivityList(activities);
		}
	}, [userState.user.activities]);

	return (
		<div className="activity-content">
			<div className="o-container">{activityList}</div>
		</div>
	);
};

const Activity = () => {
	const { state } = useContext(UserContext);
	const { isLoggedIn: userAuthenticated } = state;

	if (!userAuthenticated) {
		return <ActivityContentLoginRequired />;
	}
	return <ActivityLayout state={state} />;
};

export default Activity;
