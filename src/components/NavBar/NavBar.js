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

import { useTranslation } from 'react-i18next'

const NavBar = () => {
	const { t, i18n } = useTranslation();
	const { state: userState, actions: userActions } = useContext(UserContext);
	const { state: web3State } = useContext(Web3Context);
	const [langOpen, setLangOpen] = React.useState(false);
	const [open, setOpen] = React.useState(false);
	const anchorRef = React.useRef(null);
	const prevOpen = React.useRef(open);
	const langRef = React.useRef(langOpen);

	let ovrsOwned;
	if (web3State.ovrsOwned) {
		ovrsOwned = web3State.ovrsOwned.split('.');
		if (ovrsOwned.length > 1) {
			let decimals = ovrsOwned[1].substring(0, 2);
			ovrsOwned = ovrsOwned[0] + '.' + decimals;
		} else {
			ovrsOwned = ovrsOwned[0];
		}
	}

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

	React.useEffect(() => {
		if (userState.isLoggedIn) {
			if (prevOpen.current === true && open === false) {
				anchorRef.current.focus();
			}
			prevOpen.current = open;
		}
	}, [open]);
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
				<NavLink className="NavBar__link" to="/profile">
					{t('Navbar.profile.label')}
				</NavLink>
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
										changeLanguage("zh-hk");
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
					
						{/* <Link
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
						</Link>  // TODO: KYC - Remove comment */}

						<div className="Funds__container">
							{/* <Link to="/buy-tokens" className="Funds__link">
								<ValueCounter value={ovrsOwned}></ValueCounter>
							</Link> // TODO: KYC - Remove comment */}
							<ValueCounter value={ovrsOwned}></ValueCounter>
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
							<span>{userState.user && userState.user.username}</span>
							<div className="Profile__img-cont">
								<div
									id="Profile__img"
									className="Profile__img"
									style={{ backgroundImage: 'url(../../assets/img/auction-map.png)' }}
								>
									<Blockies
										seed={(userState.user && userState.user.uuid) || 'wewewe'}
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
												{/* <MenuItem
													onClick={(e) => {
														handleClose(e);
														handleGoTo('/activity');
													}}
												>
													Activity
												</MenuItem>   // TODO: KYC - Remove comment*/}
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
			rightContainer = (
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
			);
		}
		return rightContainer;
	}

	return (
		<div className="NavBar">
			<Link to="/" className="Logo__link">
				<div className="Icon NavBar__logo">
					<svg
						width="234px"
						height="260px"
						viewBox="0 0 234 260"
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
						xmlnsXlink="http://www.w3.org/1999/xlink"
					>
						<title>{t('Navbar.ovr')}</title>
						<desc>{t('Navbar.ovr.logo')}</desc>
						<defs>
							<linearGradient x1="25.3511512%" y1="49.9738242%" x2="107.245785%" y2="49.9738242%" id="linearGradient-1">
								<stop stopColor="#6B32C1" offset="0%"></stop>
								<stop stopColor="#C81D5E" offset="99.6%"></stop>
							</linearGradient>
							<linearGradient x1="0%" y1="49.997576%" x2="100.032735%" y2="49.997576%" id="linearGradient-2">
								<stop stopColor="#EC663C" offset="0%"></stop>
								<stop stopColor="#F9B426" offset="100%"></stop>
							</linearGradient>
							<linearGradient x1="52.9498211%" y1="9.77958549%" x2="46.413551%" y2="97.6215544%" id="linearGradient-3">
								<stop stopColor="#0081DD" offset="0%"></stop>
								<stop stopColor="#0589E0" offset="18.55%"></stop>
								<stop stopColor="#11A0E9" offset="47.85%"></stop>
								<stop stopColor="#25C5F8" offset="84.03%"></stop>
								<stop stopColor="#2FD7FF" offset="99.72%"></stop>
							</linearGradient>
							<linearGradient
								x1="50.0693857%"
								y1="83.9637181%"
								x2="50.0693857%"
								y2="-0.0504747626%"
								id="linearGradient-4"
							>
								<stop stopColor="#4E4D4C" offset="0%"></stop>
								<stop stopColor="#5A5858" offset="12.43%"></stop>
								<stop stopColor="#747273" offset="46.61%"></stop>
								<stop stopColor="#848183" offset="76.91%"></stop>
								<stop stopColor="#8A8789" offset="100%"></stop>
							</linearGradient>
							<radialGradient
								cx="35.4086957%"
								cy="34.4852355%"
								fx="35.4086957%"
								fy="34.4852355%"
								r="66.2842391%"
								id="radialGradient-5"
							>
								<stop stopColor="#FFFFFF" offset="0%"></stop>
								<stop stopColor="#FDFDFC" stopOpacity="0.8589" offset="35.27%"></stop>
								<stop stopColor="#F6F6F2" stopOpacity="0.7424" offset="64.4%"></stop>
								<stop stopColor="#EAEBE0" stopOpacity="0.635" offset="91.26%"></stop>
								<stop stopColor="#E5E6D9" stopOpacity="0.6" offset="100%"></stop>
							</radialGradient>
							<linearGradient x1="21.2472955%" y1="18.1560041%" x2="81.1871703%" y2="81.6403727%" id="linearGradient-6">
								<stop stopColor="#FFFFFF" offset="0%"></stop>
								<stop stopColor="#FFFFFF" stopOpacity="0.5" offset="99.99%"></stop>
							</linearGradient>
							<linearGradient x1="37.2050099%" y1="17.2946945%" x2="63.1259484%" y2="89.469351%" id="linearGradient-7">
								<stop stopColor="#FFFFFF" offset="0%"></stop>
								<stop stopColor="#FFFFFF" stopOpacity="0.3" offset="99.99%"></stop>
							</linearGradient>
						</defs>
						<g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
							<g id="logo_ovr">
								<g id="Group">
									<path
										d="M228.9,48.9 C226,44.9 222,41.6 217.3,39.7 L182.3,25 L127.6,2.1 C124.2,0.7 120.6,0 117,0 L117,96.6 L117,163.6 L228.9,210.5 C232.2,205.9 234,200.4 234,194.5 L234,64.9 C234.1,59.1 232.2,53.5 228.9,48.9 Z"
										id="h_viola_1_"
										fill={`url(${window.location}#linearGradient-1`}
									></path>
									<path
										d="M106.5,2.1 L19.8,38.4 L16.8,39.7 C12,41.7 8.1,44.9 5.2,48.9 C1.9,53.5 0,59.1 0,64.9 L0,194.4 C0,200.3 1.9,205.8 5.1,210.4 L117,163.5 L117,96.5 L117,0 C113.4,0 109.8,0.7 106.5,2.1 Z"
										id="h_org_1_"
										fill={`url(${window.location}#linearGradient-2`}
									></path>
									<path
										d="M117,163.5 L5.1,210.4 C8,214.4 11.9,217.6 16.6,219.6 L88.7,250.3 L106.2,257.8 C109.6,259.3 113.3,260 116.9,260 C120.6,260 124.2,259.3 127.6,257.8 L139.8,252.6 L217.2,219.6 C221.9,217.6 225.9,214.4 228.7,210.4 L117,163.5 Z"
										id="h_blu_1_"
										fill={`url(${window.location}#linearGradient-3`}
									></path>
									<path
										d="M198.7,67.6 C196.6,64.5 193.7,62 190.2,60.5 L164.7,49.2 L124.8,31.6 C122.3,30.5 119.7,30 117.1,30 C114.5,30 111.8,30.5 109.4,31.6 L46.1,59.5 L43.9,60.5 C40.4,62 37.5,64.5 35.4,67.6 C33,71.1 31.6,75.4 31.6,79.9 L31.6,179.6 C31.6,184.1 33,188.4 35.3,191.9 C37.4,195 40.3,197.5 43.7,199 L96.3,222.6 L109.1,228.4 C111.6,229.5 114.3,230.1 116.9,230.1 C119.5,230.1 122.2,229.5 124.7,228.4 L133.6,224.4 L190.1,199 C193.5,197.5 196.4,195 198.5,191.9 C200.9,188.4 202.2,184.1 202.2,179.6 L202.2,79.9 C202.5,75.4 201.1,71.1 198.7,67.6 Z"
										id="h_hex-trasp_1_"
										fill={`url(${window.location}#linearGradient-4`}
										opacity="0.45"
										style={{ mixBlendMode: 'color-burn' }}
									></path>
									<circle
										id="h_sphere_1_"
										fill={`url(${window.location}#radialGradient-5)`}
										cx="117"
										cy="129.6"
										r="55.2"
									></circle>
									<path
										d="M217.3,39.7 L182.3,25 L127.6,2.1 C124.2,0.7 120.6,0 117,0 C113.4,0 109.8,0.7 106.4,2.1 L19.8,38.4 L16.8,39.7 C12,41.7 8.1,44.9 5.2,48.9 L117,96.6 L228.9,49 C226,44.9 222,41.7 217.3,39.7 Z"
										id="h_top_1_"
										fill={`url(${window.location}#linearGradient-6`}
										opacity="0.76"
										style={{ mixBlendMode: 'soft-light' }}
									></path>
									<path
										d="M228.9,48.9 L117,96.6 L117,163.6 L117,260 C120.7,260 124.3,259.3 127.7,257.8 L139.9,252.6 L217.3,219.6 C222,217.6 226,214.4 228.8,210.4 C232.1,205.8 233.9,200.3 233.9,194.4 L233.9,64.9 C234.1,59.1 232.2,53.5 228.9,48.9 Z"
										id="h_left_1_"
										fill={`url(${window.location}#linearGradient-7`}
										style={{ mixBlendMode: 'soft-light' }}
									></path>
								</g>
							</g>
						</g>
					</svg>
				</div>
			</Link>
			<div className="Navbar__link_container">
				{leftContainer()}
				{/* <NavLink className="NavBar__link" to="/map/overview">
					My Assets
				</NavLink>
				<NavLink className="NavBar__link" to="/map/discover">
					Marketplace
				</NavLink> // TODO: KYC - Remove comment */}
				{centerContainer()}
				{rightContainer()}
			</div>
		</div>
	);
};

export default withUserContext(withWeb3Context(NavBar));
