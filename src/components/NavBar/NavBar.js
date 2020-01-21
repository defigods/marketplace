import React, { Component } from 'react';
import { Link, NavLink } from "react-router-dom";
import Icon from '../Icon/Icon';
import ValueCounter from '../ValueCounter/ValueCounter';


class NavBar extends Component {

    render() {
        return <div className="NavBar">
            <Link to="/" className="Logo__link"><Icon src="./assets/icons/logo_ovr_white.svg" className='NavBar__logo' isSvg={true}></Icon></Link>
            <div className="Navbar__link_container">
                <NavLink className="NavBar__link" to="/">
                    Discover
                </NavLink>
                <NavLink className="NavBar__link" to="/">
                    Overview
                </NavLink>
                <NavLink className="NavBar__link" to="/">
                    Profile
                </NavLink>
            </div>
            <div className="Navbar__right_container">
                <Link to="/" className="Notifications__link">
                    <Icon src="./assets/icons/icon_notification.svg" className='Notifications__icon' isSvg={true}></Icon>
                    <div className="Notifications__counter">2</div>
                </Link>
                <Link to="/" className="Funds__link"><ValueCounter value="150"></ValueCounter></Link>
            </div>
            <Link to="/" className="Profile__link"><div className="Profile__img" style={{ backgroundImage: 'url(./assets/img/auction-map.png)' }}></div></Link>
        </div>;
    }
}

export default NavBar