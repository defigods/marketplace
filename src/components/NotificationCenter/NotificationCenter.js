import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Notification from '../Notification/Notification';

import { UserContext, withUserContext } from '../../context/UserContext';
import { readAllNotifications } from '../../lib/api';

export class NotificationCenter extends Component {
	static contextType = UserContext;
	constructor(props) {
		super(props);
	}

	renderNotifications = () => {
		let notifications;
		console.log('Notification Center this.context.state.user', this.context.state.user);
		if (
			this.context.state.user.notifications != null &&
			this.context.state.user.notifications.content &&
			this.context.state.user.notifications.content.length > 0
		) {
			notifications = this.context.state.user.notifications.content.map((obj) => (
				<Notification
					key={obj.uuid}
					data={obj}
					actions={{ toggleNotificationCenter: this.context.actions.toggleShowNotificationCenter, setAsReaded: this.context.actions.notification.setAsReaded }}
				></Notification>
			));
		} else {
			notifications = (
				<div className="c-dialog --centered">
					<div className="c-dialog-sub-title">
						There is currently <br></br>no notifications to display.
					</div>
				</div>
			);
		}
		return notifications;
	};

	setAllAsReaded = () => {
		readAllNotifications().then((response) => {
			this.context.actions.notification.setAllAsReaded()
			this.context.actions.toggleShowNotificationCenter()
		});
	};

	render() {
		if (!this.context.state.showNotificationCenter) return null;

    return (
      <div className="NotificationCenter">
        <div className="NotificationCenter__header">
          <div className="NotificationCenter__title">Notifications</div>
          <div className="NotificationCenter__toggle"></div>
        </div>
        <div className="NotificationCenter__body">
          {this.renderNotifications()}
        </div>
        <div className="NotificationCenter__footer">
          <Link to={'#'} onClick={this.setAllAsReaded}>Mark all as read</Link>
        </div>
      </div>
    );
  }
}

export default withUserContext(NotificationCenter);
