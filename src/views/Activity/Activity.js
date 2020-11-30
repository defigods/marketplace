import React, { useContext, useEffect, useState } from 'react';
import * as moment from 'moment';

import { userActivities } from '../../lib/api';
import { UserContext } from '../../context/UserContext';
import { Web3Context } from '../../context/Web3Context';
import ActivityTile from '../../components/ActivityTile/ActivityTile';
import { useTranslation } from 'react-i18next'


const ActivityContentLoginRequired = () => {
	const { t, i18n } = useTranslation();
	return (<div className="profile">
		<div className="o-container">
			<div className="c-dialog --centered">
				<div className="c-dialog-main-title">
					{t('Activity.login.required')}
					<span role="img" aria-label="Cool dude">
						😎
					</span>
				</div>
				<div className="c-dialog-sub-title">{t('Activity.login.now')}</div>
			</div>
		</div>
	</div>)
}

const ActivityLayout = () => {
	const currentDatetimeStamp = moment().format('HH:mm, dddd, MMM D, YYYY');
	const { t, i18n } = useTranslation();
	return (
		<div className="activity">
			<div className="o-container">
				<div className="p-header">
					<h2 className="p-header-title">Activity</h2>
					<span className="p-header-datetime">{currentDatetimeStamp}</span>
				</div>
				<div className="sub-title">
					{t('Activity.list.transactions')}
				</div>
			</div>
			<ActivityContent t={t}></ActivityContent>
		</div>
	);
};

const ActivityContent = () => {
	const { state: userState } = useContext(UserContext);
	const { actions: userActions } = useContext(UserContext);
	const [activityList, setActivityList] = useState(false);
	const web3Context = useContext(Web3Context);
	const { user } = userState;
	const { t, i18n } = useTranslation();

	// Update activities when componenet is loaded
	useEffect(() => {
		userActivities().then((response) => {
			userActions.setUserActivity(response.data.user);
		});
	}, []);

	// Update activities when receive a notification
	useEffect(() => {
		userActivities().then((response) => {
			userActions.setUserActivity(response.data.user);
		});
	}, [userState.user.notifications]);

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
			if (activities.length === 0 || activities === undefined) {
				activities = (
					<div className="profile">
						<div className="o-container">
							<div className="c-dialog --centered">
								<div className="c-dialog-sub-title">
									{t('Activity.no.activity')}
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
		return <ActivityContentLoginRequired/>;
	}
	return <ActivityLayout state={state} />;
};

export default Activity;
