import React, { useRef, useEffect, useContext } from 'react';

import { Link } from 'react-router-dom';
import Notification from '../Notification/Notification';

import { UserContext, withUserContext } from '../../context/UserContext';
import { readAllNotifications } from '../../lib/api';

const NotificationCenterContent = () => {
	const { state, actions } = useContext(UserContext);
	const wrapperRef = useRef(null);

	useEffect(() => {
	}, [state.user.notifications]);

	const renderNotifications = () => {
		let notifications;
		if (
			state.user.notifications !== null &&
			state.user.notifications.content &&
			state.user.notifications.content.length > 0
		) {
			notifications = state.user.notifications.content.map((obj) => (
				<Notification
					key={obj.uuid}
					data={obj}
					actions={{
						toggleNotificationCenter: actions.toggleShowNotificationCenter,
						setAsReaded: actions.notification.setAsReaded,
					}}
				></Notification>
			));
			return notifications;
		} else {
			return (
				<div className="c-dialog --centered">
					<div className="c-dialog-sub-title">
						There is currently <br></br>no notifications to display.
					</div>
				</div>
			);
		}
	};

	const setAllAsReaded = () => {
		readAllNotifications().then(() => {
			actions.notification.setAllAsReaded();
			actions.closeNotificationCenter();
		});
	};

	const useOutsideAlerter = (ref) => {
		useEffect(() => {
			/**
			 * Alert if clicked on outside of element
			 */
			function handleClickOutside(event) {
				// document.c Notifications__link
				if (
					ref.current &&
					!ref.current.contains(event.target) &&
					!document.getElementById('js-open-notification-link').contains(event.target) &&
					!event.target.classList.contains('MuiMenuItem-root')
				) {
					actions.closeNotificationCenter();
				}
			}

			// Bind the event listener
			document.addEventListener('mousedown', handleClickOutside);
			return () => {
				// Unbind the event listener on clean up
				document.removeEventListener('mousedown', handleClickOutside);
			};
		}, [ref]);
	};

	return (
		<div ref={wrapperRef} className="NotificationCenter">
			{useOutsideAlerter(wrapperRef)}
			<div className="NotificationCenter__header">
				<div className="NotificationCenter__title">Notifications</div>
				<div className="NotificationCenter__toggle"></div>
			</div>
			<div className="NotificationCenter__body">{renderNotifications()}</div>
			<div className="NotificationCenter__footer">
				<Link to={'#'} onClick={setAllAsReaded}>
					Mark all as read
				</Link>
			</div>
		</div>
	);
};

const NotificationCenter = () => {
	const { state } = useContext(UserContext);
	const { showNotificationCenter: showNotificationCenter } = state;

	if (!showNotificationCenter) {
		return null;
	}

	return <NotificationCenterContent />;
};

export default withUserContext(NotificationCenter);
