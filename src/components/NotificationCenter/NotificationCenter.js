import React, { Component } from 'react';
import { Link } from "react-router-dom";
import Notification from '../Notification/Notification';


export class NotificationCenter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      something: false
    }
  }

  renderNotifications = () => {
    let notifications
    if(this.props.notifications != null && this.props.notifications.content){
      notifications = this.props.notifications.content.map((obj) =>
        <Notification data={obj}></Notification>
      )
    } else {
      notifications = "n"
    }
    return notifications
  }
  render() {
    if (!this.props.active) return null

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
          <Link>Mark all as read</Link>
        </div>
      </div>
    );
  }
}

export default NotificationCenter;
