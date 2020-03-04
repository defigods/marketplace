import React, { Component } from 'react';
import { Link, NavLink } from "react-router-dom";
import Icon from '../Icon/Icon';
import ValueCounter from '../ValueCounter/ValueCounter';

import { UserContext, withUserContext } from '../../context/UserContext';

import logo from '../../assets/icons/logo_ovr_white.svg'
import icon_notification from '../../assets/icons/icon_notification.svg'

class NavBar extends Component {
  static contextType = UserContext

  render() {
    let rightContainer = <div></div>
    if (this.context.state.isLoggedIn === true) {
      rightContainer = <>
      <div className="Navbar__right_container">
        <Link to="/" className="Notifications__link">
          <Icon src={icon_notification} className='Notifications__icon' isSvg={true}></Icon>
          <div className="Notifications__counter">2</div>
        </Link>
        <Link to="/" className="Funds__link"><ValueCounter value="150"></ValueCounter></Link>
      </div>
      <Link to="/" className="Profile__link"><div className="Profile__img" style={{ backgroundImage: 'url(../../assets/img/auction-map.png)' }}></div></Link>
      </>
      
    } else {
      rightContainer = <>
        <NavLink className="NavBar__link General__link AuthLogin__link" to="/login">
          Login
        </NavLink>
      </>
    }

    return <div className="NavBar">
      <Link to="/" className="Logo__link"><Icon src={logo} className='NavBar__logo' isSvg={true}></Icon></Link>
      <div className="Navbar__link_container">
        <NavLink className="NavBar__link" to="/map/discover">
          Discover
        </NavLink>
        <NavLink className="NavBar__link" to="/map/overview">
          Overview
        </NavLink>
        <NavLink className="NavBar__link" to="/profile">
          Profile
        </NavLink>
      </div>
      {rightContainer}
    </div>;
  }
}

export default withUserContext(NavBar)