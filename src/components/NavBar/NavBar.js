import React, { Component } from 'react';
import { Link, NavLink } from "react-router-dom";
import Icon from '../Icon/Icon';
import ValueCounter from '../ValueCounter/ValueCounter';

import { UserContext, withUserContext } from '../../context/UserContext';

import logo from '../../assets/icons/logo_ovr_white.svg'
import icon_notification from '../../assets/icons/icon_notification.svg'
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
          <div className="Notifications__icon">
            <svg width="18px" height="20px" viewBox="0 0 18 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <title>icons/icon_notification</title>
                <desc>Created with Sketch.</desc>
                <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="header" transform="translate(-1243.000000, -25.000000)">
                        <g id="icons/icon_notification" transform="translate(1242.000000, 25.000000)">
                            <rect id="frame" x="0" y="0" width="20" height="20"></rect>
                            <path d="M15.2321227,8.31973225 C12.6665198,2.77582053 11.3339364,0.670834332 7.14155795,0.75810667 C5.64837822,0.788892058 6.00782137,-0.327572512 4.86958472,0.0960796141 C3.73134807,0.51973174 4.70814468,1.13967602 3.54347011,2.098542 C0.278387518,4.79042761 0.57932975,7.2806548 2.09444733,13.2148914 C2.73261361,15.7150038 0.556266888,15.8375804 1.41746793,18.2603057 C2.04607157,20.0275 6.68001944,20.7669142 11.5713151,18.9443627 C16.4614858,17.1226586 19.5474093,13.506364 18.9190869,11.7400171 C18.0576046,9.31616205 16.3141084,10.6543379 15.2321227,8.31973225 Z M11.039463,17.4514126 C6.67242557,19.0788016 3.08305662,18.1221951 2.93146049,17.696566 C2.67017513,16.9628005 4.34110766,14.5146561 9.33449868,12.6545408 C14.3278897,10.7944255 17.113996,11.4838488 17.4050944,12.3037568 C17.5775033,12.7870027 15.4079067,15.824306 11.039463,17.4514126 Z M9.63656593,13.5041045 C7.35362378,14.354798 5.76594257,15.3277857 4.73992643,16.2036159 C5.46162528,16.8633835 6.81642784,17.0246537 8.16644907,16.521355 C9.88491359,15.8816403 10.9396177,14.4121323 10.5219549,13.2391807 C10.517736,13.225059 10.5098609,13.2129143 10.5045171,13.1985101 C10.2232627,13.2922785 9.93441437,13.3925428 9.63656593,13.5041045 Z" id="Fill-1" fill="#2B3034" fill-rule="evenodd" opacity="0.400000006" transform="translate(10.000000, 10.000000) scale(-1, 1) translate(-10.000000, -10.000000) "></path>
                        </g>
                    </g>
                </g>
            </svg>
          </div>
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