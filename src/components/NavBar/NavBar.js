import React, { useContext, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import ValueCounter from '../ValueCounter/ValueCounter';
import NotificationCenter from '../NotificationCenter/NotificationCenter';

import { UserContext, withUserContext } from '../../context/UserContext';
import Blockies from 'react-blockies';
import { Web3Context, withWeb3Context } from '../../context/Web3Context';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';
import { useHistory } from 'react-router-dom';
import Translate from '@material-ui/icons/Translate';
import { removeUser } from '../../lib/auth';

import { useTranslation } from 'react-i18next'

const NavBar = () => {
	const { t, i18n } = useTranslation();
	const { state: userState, actions: userActions } = useContext(UserContext);
	const { state: web3State, actions: web3Actions } = useContext(Web3Context);
	const [langOpen, setLangOpen] = React.useState(false);
	const [balance, setBalance] = React.useState(0);
	const [open, setOpen] = React.useState(false);
	const anchorRef = React.useRef(null);
	const [isConnecting, setIsConnecting] = React.useState(false);
	const prevOpen = React.useRef(open);
	const langRef = React.useRef(langOpen);
	
	const changeLanguage = (string) => {
		i18n.changeLanguage(string)
	  }

	// START - Profile sub menu


	let history = useHistory();

	const handleToggle = () => {
		setOpen((prevOpen) => !prevOpen);
	};

	const handleLang = () => {
		setLangOpen((langOpen) => !langOpen);
	};

	const handleGoTo = (link) => {
		history.push(link);
	};

	const handleClose = (event) => {
		if (anchorRef.current && anchorRef.current.contains(event.target)) {
			return;
		}
		setOpen(false);
	};

	const handleCloseLang = (event) => {
		if(event){
			if (anchorRef.current && anchorRef.current.contains(event.target)) {
				return;
			}
		}
		setLangOpen(false);
	};

	const handleMetamaskAuthentication = () => {
		setIsConnecting(true);
		window.gtag_report_metamask_conversion();
		window.twitter_push_wallet_connect();
		web3Actions.setupWeb3((res) => {
			if( res == false ){
				history.push('/login-helper');
			} else {
				history.push('/profile');
			}
			setIsConnecting(false);
		})
	}
	
	React.useEffect(() => {
		if (userState.isLoggedIn) {
			if (prevOpen.current === true && open === false) {
				anchorRef.current.focus();
			}
			prevOpen.current = open;
		}
	}, [open]);

	React.useEffect(() => {
		if(userState.user != undefined && userState.user.balance != undefined){
			setBalance(userState.user.balance.toFixed(2))
		}
	}, [userState.user]);
	// END - Profile sub menu

	React.useEffect(() => {
		// console.log('NOTIF userState', userState.user);
	}, [userState]);

	function toggleNotificationCenter(e) {
		e.preventDefault();
		userActions.toggleShowNotificationCenter(true);
	}

	function centerContainer() {
		let cont = <div></div>;
		if (userState.isLoggedIn === true && userState.user !== null) {
			cont = (
				<>
				<NavLink className="NavBar__link" to="/profile">
					{t('Navbar.profile.label')}
				</NavLink>
				<NavLink className="NavBar__link" to="/map/overview">
					My Assets
				</NavLink>
				<NavLink className="NavBar__link" to="/map/discover">
					Marketplace
				</NavLink>
				</>
			);
		}
		return cont;
	}

	function leftContainer(){
		let cont =<></>
		cont = (
		<div className="Navbar__left_container">
		<Link
			to="#"
			className="NavBar__link Language__link"
			ref={langRef}
			aria-controls={langOpen ? 'menu-list-grow' : undefined}
			aria-haspopup="true"
			onClick={(e) => {
				handleCloseLang(e);
				handleLang(e);
			}}
		>
			<Translate className="Translate" shapeRendering="auto"/>
		</Link>
		<Popper open={langOpen} anchorEl={langRef.current} role={undefined} transition disablePortal>
			{({ TransitionProps, placement }) => (
				<Grow
					{...TransitionProps}
					style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
				>
					<Paper>
						<ClickAwayListener onClickAway={handleCloseLang}>
							<MenuList autoFocusItem={langOpen} id="menu-lang-list-grow" className="navbar-lang-submenu">
								<MenuItem
									onClick={(e) => {
										changeLanguage("en");
										handleCloseLang();
									}}
								>
									English
								</MenuItem>
								<MenuItem
									onClick={(e) => {
										changeLanguage("zh");
										handleCloseLang();
									}}
								>
									中文
								</MenuItem>
							</MenuList>
						</ClickAwayListener>
					</Paper>
				</Grow>
			)}
		</Popper>
		</div>)
		return cont
	}

	function rightContainer() {
		let rightContainer = <div></div>; 
		if (userState.isLoggedIn === true && userState.user !== null) {
			rightContainer = (
				<>
					<div className="Navbar__right_container">
					
						<Link
							to="/"
							id="js-open-notification-link"
							className="Notifications__link"
							onClick={toggleNotificationCenter}
						>
							<div className="Notifications__icon">
								<svg width="18px" height="20px" viewBox="0 0 18 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
									<title>icons/icon_notification</title>
									<desc>Created with Sketch.</desc>
									<g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
										<g id="header" transform="translate(-1243.000000, -25.000000)">
											<g id="icons/icon_notification" transform="translate(1242.000000, 25.000000)">
												<rect id="frame" x="0" y="0" width="20" height="20"></rect>
												<path
													d="M15.2321227,8.31973225 C12.6665198,2.77582053 11.3339364,0.670834332 7.14155795,0.75810667 C5.64837822,0.788892058 6.00782137,-0.327572512 4.86958472,0.0960796141 C3.73134807,0.51973174 4.70814468,1.13967602 3.54347011,2.098542 C0.278387518,4.79042761 0.57932975,7.2806548 2.09444733,13.2148914 C2.73261361,15.7150038 0.556266888,15.8375804 1.41746793,18.2603057 C2.04607157,20.0275 6.68001944,20.7669142 11.5713151,18.9443627 C16.4614858,17.1226586 19.5474093,13.506364 18.9190869,11.7400171 C18.0576046,9.31616205 16.3141084,10.6543379 15.2321227,8.31973225 Z M11.039463,17.4514126 C6.67242557,19.0788016 3.08305662,18.1221951 2.93146049,17.696566 C2.67017513,16.9628005 4.34110766,14.5146561 9.33449868,12.6545408 C14.3278897,10.7944255 17.113996,11.4838488 17.4050944,12.3037568 C17.5775033,12.7870027 15.4079067,15.824306 11.039463,17.4514126 Z M9.63656593,13.5041045 C7.35362378,14.354798 5.76594257,15.3277857 4.73992643,16.2036159 C5.46162528,16.8633835 6.81642784,17.0246537 8.16644907,16.521355 C9.88491359,15.8816403 10.9396177,14.4121323 10.5219549,13.2391807 C10.517736,13.225059 10.5098609,13.2129143 10.5045171,13.1985101 C10.2232627,13.2922785 9.93441437,13.3925428 9.63656593,13.5041045 Z"
													id="Fill-1"
													fill="#2B3034"
													fillRule="evenodd"
													opacity="0.400000006"
													transform="translate(10.000000, 10.000000) scale(-1, 1) translate(-10.000000, -10.000000) "
												></path>
											</g>
										</g>
									</g>
								</svg>
							</div>
							<div className="Notifications__counter">
								{userState.user && userState.user.notifications && userState.user.notifications.unreadedCount
									? userState.user.notifications.unreadedCount
									: 0}
							</div>
						</Link> 

						<div className="Funds__container">
							{/* <Link to="/buy-tokens" className="Funds__link">
								<ValueCounter value={ovrsOwned}></ValueCounter>
							</Link> // TODO: KYC - Remove comment */}
							<ValueCounter value={balance}></ValueCounter>
							{/*<Link to="#" className="Funds__buy HexButton --blue redeem-button" onClick={() => {
								this.context.actions.redeemLands()
							}}>
								Redeem Lands
							</Link>
							<Link to="/buy-tokens" className="Funds__buy HexButton --blue">
								Buy OVR
							</Link> */}
						</div>

						<Link
							ref={anchorRef}
							aria-controls={open ? 'menu-list-grow' : undefined}
							aria-haspopup="true"
							to="#"
							className="Profile__link"
							onClick={handleToggle}
						>
							<span>{userState.user && userState.user.reducedPublicAddress}</span>
							<div className="Profile__img-cont">
								<div
									id="Profile__img"
									className="Profile__img"
									style={{ backgroundImage: 'url(../../assets/img/auction-map.png)' }}
								>
									<Blockies
										seed={(userState.user && userState.user.publicAddress) || 'loading'}
										size={12}
										scale={3}
										color="#7521c8"
										bgColor="#EC663C"
										spotColor="#F9B426"
									/>
								</div>
							</div>
						</Link>
						<Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
							{({ TransitionProps, placement }) => (
								<Grow
									{...TransitionProps}
									style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
								>
									<Paper>
										<ClickAwayListener onClickAway={handleClose}>
										

											<MenuList autoFocusItem={open} id="menu-list-grow" className="navbar-submenu">
												
												<MenuItem
													onClick={(e) => {
														handleClose(e);
														handleGoTo('/profile');
													}}
												>
													{t('Navbar.profile.label')}
												</MenuItem>
												<MenuItem
													onClick={(e) => {
														handleClose(e);
														handleGoTo('/activity');
													}}
												>
													Activity
												</MenuItem>
												<MenuItem
													onClick={(e) => {
														handleClose(e);
														userActions.logoutUser();
													}}
												>
													{t('Navbar.Logout.label')}
												</MenuItem>
											</MenuList>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
						<NotificationCenter></NotificationCenter>
					</div>
				</>
			);
		} else {
			/* rightContainer = (
				<div>
					<div className="AuthLogin__link">
						<NavLink className="NavBar__link General__link" to="/login">
						{t('Navbar.Login.label')}
						</NavLink>
						<NavLink className="NavBar__link General__link" to="/signup">
						{t('Navbar.Signup.label')}
						</NavLink>
					</div>
				</div>
			); */
			rightContainer = (
				<div className="AuthLogin__link">
					<div className={`HexButton --orange ${!isConnecting ? '' : '--disabled'}`} onClick={handleMetamaskAuthentication}>
						{t('Navbar.wallet.connect')}
					</div>
				</div>
			)
		}
		return rightContainer;
	}

	return (
		<div className="NavBar">
			<Link to="/" className="Logo__link">
				<div className="Icon NavBar__logo">
					<img src={require('../../assets/img/ovr.png')} />
				</div>
			</Link>
			<div className="Navbar__link_container">
				{leftContainer()}
				{centerContainer()}
				{rightContainer()}
			</div>
		</div>
	);
};

export default withUserContext(withWeb3Context(NavBar));
