import React, { Component } from 'react';
import { Link, NavLink } from "react-router-dom";
import Icon from '../Icon/Icon';
import ValueCounter from '../ValueCounter/ValueCounter';

import { UserContext, withUserContext } from '../../context/UserContext';

import logo from '../../logo_ovr_white.svg'
import icon_notification from '../../icon_notification.svg'
import Blockies from 'react-blockies';

class NavBar extends Component {
  static contextType = UserContext

  render() {
    let rightContainer = <div></div>
    let state = this.context.state

    if (state.isLoggedIn === true) {
      rightContainer = <>
      <div className="Navbar__right_container">
        <Link to="/" className="Notifications__link">
          <Icon src={icon_notification} className='Notifications__icon' isSvg={true}></Icon>
          <div className="Notifications__counter">0</div>
        </Link>
        <Link to="/" className="Funds__link"><ValueCounter value={state.user.balance}></ValueCounter></Link>
      </div>
      <Link to="/" className="Profile__link">
        <div id="Profile__img" className="Profile__img" style={{ backgroundImage: 'url(../../assets/img/auction-map.png)' }}>
          <Blockies
            seed={state.user.uuid}
            size={12}
            scale={3}
            color="#7521c8"
            bgColor="#EC663C"
            spotColor="#F9B426"
          />
        </div>
      </Link>
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