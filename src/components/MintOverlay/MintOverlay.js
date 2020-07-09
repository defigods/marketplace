import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { withMapContext } from '../../context/MapContext';
import { withUserContext } from '../../context/UserContext';
import { withWeb3Context } from '../../context/Web3Context';
import ValueCounter from '../ValueCounter/ValueCounter';
import HexButton from '../HexButton/HexButton';
import config from '../../lib/config';
import { warningNotification, dangerNotification } from '../../lib/notifications';
import PropTypes from 'prop-types';

import MenuItem from '@material-ui/core/MenuItem';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';

const MintOverlay = (props) => {
	const { participateMint, approveOvrTokens } = props.web3Provider.actions;
	const { lastTransaction, ovr, dai, tether, usdc, ico, setupComplete } = props.web3Provider.state;
	const { hexId } = props.land;
	const { marketStatus } = props.land;

	const [bidValid, setBidValid] = useState(false);
	const [nextBid, setNextBid] = useState(10);
	const [activeStep, setActiveStep] = useState(0);
	const [metamaskMessage, setMetamaskMessage] = useState('Waiting for MetaMask confirmation');
	const [bid, setBid] = useState(0);
	const [showOverlay, setShowOverlay] = useState(false);
	const [classShowOverlay, setClassShowOverlay] = useState(false);

	const anchorRef = React.useRef(null);
	const [open, setOpen] = React.useState(false);

	function setDeactiveOverlay(e) {
		e.preventDefault();
		props.mapProvider.actions.changeActiveMintOverlay(false);
		setTimeout(() => {
			setOpen(false);
			setActiveStep(0);
		}, 500);
	}

	// Listener for fadein and fadeout animation of overlay
	useEffect(() => {
		if (props.mapProvider.state.activeMintOverlay) {
			setShowOverlay(true);
			setTimeout(() => {
				setClassShowOverlay(true);
			}, 50);
		} else {
			setClassShowOverlay(false);
			setTimeout(() => {
				setShowOverlay(false);
			}, 500);
		}
	}, [props.mapProvider.state.activeMintOverlay]);

	// Init helpers web3
	useEffect(() => {
		if (setupComplete) setNextBidSelectedLand();
	}, [setupComplete, ico, ovr, hexId, marketStatus]);

	const setNextBidSelectedLand = async () => {
		if (!setupComplete || !ico || !ovr) {
			return warningNotification('Metamask not detected', 'You must login to metamask to use this application');
		}
		const initialBid = String(await ico.initialLandBidAsync());
		let nextPayment = window.web3.fromWei(initialBid);
		setNextBid(nextPayment);
	};

	// Toggle bidding menu of selection currencies
	const handleClose = (event) => {
		if (anchorRef.current && anchorRef.current.contains(event.target)) {
			return;
		}
		setOpen(false);
	};
	const handleClick = () => {
		setOpen(true);
	};

	// Update bid value in state
	const updateNewBidValue = (myBid) => {
		if (myBid >= nextBid && myBid >= 10) {
			setBidValid(true);
		} else {
			setBidValid(false);
		}
		setBid(myBid);
	};

	// Helper used to check if the user is logged in
	const checkUserLoggedIn = () => {
		if (!props.userProvider.state.isLoggedIn) {
			setActiveStep(0);
			warningNotification('Invalid authentication', 'Please Log In to partecipate');
			return false;
		}
		return true;
	};

	const participateInAuction = async (type) => {
		if (bid < nextBid)
			return warningNotification('Invalid bid', 'Your bid must be equal or larger than the minimum bid');
		if (!checkUserLoggedIn()) return;
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
		try {
			switch (type) {
				case 'ovr':
					setMetamaskMessage('Approving OVR tokens...');
					await approveOvrTokens(true, ovr);
					setMetamaskMessage('Participating in the auction with OVR...');
					await participateMint(4, bid, hexId);
					break;
				case 'eth':
					setMetamaskMessage('Participating in the auction with ETH...');
					await participateMint(0, bid, hexId);
					break;
				case 'usdt':
					setMetamaskMessage('Approving Tether tokens...');
					await approveOvrTokens(true, tether);
					setMetamaskMessage('Participating in the auction with Tether...');
					await participateMint(2, bid, hexId);
					break;
				case 'usdc':
					setMetamaskMessage('Approving USDC tokens...');
					await approveOvrTokens(true, usdc);
					setMetamaskMessage('Participating in the auction with Usdc...');
					await participateMint(3, bid, hexId);
					break;
				case 'dai':
					setMetamaskMessage('Approving DAI tokens...');
					await approveOvrTokens(true, dai);
					setMetamaskMessage('Participating in the auction with Dai...');
					await participateMint(1, bid, hexId);
					break;
			}
		} catch (e) {
			setOpen(false);
			setActiveStep(0);
			return dangerNotification('Error processing the transaction', e.message);
		}
		setActiveStep(2);
	};

	function getStepContent(step) {
		switch (step) {
			case 0:
				return (
					<div className="Overlay__body_cont">
						<div className="Overlay__upper">
							<div className="Overlay__title">Start an auction for</div>
							<div className="Overlay__land_title">{props.land.name.sentence}</div>
							<div className="Overlay__land_hex">{props.land.location}</div>
						</div>
						<div className="Overlay__lower">
							<div className="bids">
								<div className="Overlay__bid_container">
									<div className="Overlay__minimum_bid">
										<div className="Overlay__bid_title">Min bid</div>
										<div className="Overlay__bid_cont">
											<ValueCounter value={10}></ValueCounter>
										</div>
									</div>
								</div>
								<div className="Overlay__minimum_bid my-bid">
									<div className="Overlay__bid_title">Your bid</div>
									<div>
										<TextField
											type="number"
											onChange={(e) => {
												const eventBid = e.target.value;
												if (eventBid > 0) updateNewBidValue(eventBid);
											}}
										/>
									</div>
								</div>
							</div>
							<br />
							<div className="Overlay__buttons_container">
								<Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
									{({ TransitionProps, placement }) => (
										<Grow
											{...TransitionProps}
											style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
										>
											<Paper>
												<ClickAwayListener onClickAway={handleClose}>
													<MenuList autoFocusItem={open} id="mint-fade-menu">
														<MenuItem
															onClick={() => {
																participateInAuction('ovr');
															}}
															className="bid-fade-menu --cons-option"
														>
															Bid using OVR
														</MenuItem>
														<MenuItem
															onClick={async () => {
																participateInAuction('eth');
															}}
															className="bid-fade-menu"
														>
															Bid using ETH
														</MenuItem>
														<MenuItem
															onClick={async () => {
																participateInAuction('dai');
															}}
															className="bid-fade-menu"
														>
															Bid using DAI
														</MenuItem>
														<MenuItem
															onClick={async () => {
																participateInAuction('usdt');
															}}
															className="bid-fade-menu"
														>
															Bid using Tether
														</MenuItem>
														<MenuItem
															onClick={async () => {
																participateInAuction('usdc');
															}}
															className="bid-fade-menu"
														>
															Bid using USDC
														</MenuItem>
													</MenuList>
												</ClickAwayListener>
											</Paper>
										</Grow>
									)}
								</Popper>
								<HexButton
									hexRef={anchorRef}
									url="#"
									text="Place bid"
									className={`--orange ${bidValid ? '' : '--disabled'}`}
									ariaControls={open ? 'mint-fade-menu' : undefined}
									ariaHaspopup="true"
									onClick={handleClick}
								></HexButton>
								<HexButton url="#" text="Cancel" className="--orange-light" onClick={setDeactiveOverlay}></HexButton>
							</div>
						</div>
					</div>
				);
			case 1:
				return (
					<div className="Overlay__body_cont">
						<div className="Overlay__upper">
							<div className="Overlay__title">Bidding the OVRLand</div>
							<div className="Overlay__land_title">{props.land.name.sentence}</div>
							<div className="Overlay__land_hex">{props.land.location}</div>
						</div>
						<div className="Overlay__lower">
							<div className="Overlay__bid_container">
								<div className="Overlay__minimum_bid">
									<div className="Overlay__bid_title">Your bid</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={bid}></ValueCounter>
									</div>
								</div>
							</div>
							<div className="Overlay__message__container">
								<span>{metamaskMessage}</span>
							</div>
						</div>
					</div>
				);
			case 2:
				return (
					<div className="Overlay__body_cont">
						<div className="Overlay__upper">
							<div className="Overlay__congrat_title">
								<span>Congratulations</span>
								<br></br>The auction is about to start
								<div className="Overlay__etherscan_link">
									<a href={config.apis.etherscan + '/tx/' + lastTransaction} rel="noopener noreferrer" target="_blank">
										View transaction status
									</a>
								</div>
							</div>
							<div className="Overlay__land_title">{props.land.name.sentence}</div>
							<div className="Overlay__land_hex">{props.land.location}</div>
						</div>
						<div className="Overlay__lower">
							<div className="Overlay__bid_container">
								<div className="Overlay__current_bid">
									<div className="Overlay__bid_title">Current bid</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={bid}></ValueCounter>
									</div>
								</div>
							</div>
							<div className="Overlay__close-button_container">
								<HexButton url="#" text="Close" className="--orange-light" onClick={setDeactiveOverlay}></HexButton>
							</div>
						</div>
					</div>
				);
			default:
				return 'Unknown step';
		}
	}

	if (!showOverlay) return null;

	return (
		<div className={`OverlayContainer ${classShowOverlay ? '--js-show' : ''}`}>
			<div className="RightOverlay__backpanel"> </div>
			<div
				key="mint-overlay-"
				to={props.url}
				className={`RightOverlay MintOverlay NormalInputs ${
					props.className ? props.className : ''
				} --activeStep-${activeStep}`}
			>
				<div className="Overlay__cont">
					<div className="Icon Overlay__close_button" onClick={setDeactiveOverlay}>
						<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg">
							<g id="Dashboards" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" fillOpacity="0">
								<g
									id="Biddign-Single-Auction"
									transform="translate(-398.000000, -298.000000)"
									fill="#c0c1c0"
									fillRule="nonzero"
								>
									<path
										d="M413,298 C404.715729,298 398,304.715729 398,313 C398,321.284271 404.715729,328 413,328 C421.284271,328 428,321.284271 428,313 C427.989405,304.720121 421.279879,298.010595 413,298 Z M417.369533,315.697384 C417.829203,316.159016 417.829203,316.90686 417.369533,317.368492 C416.90929,317.82955 416.163695,317.82955 415.703452,317.368492 L413,314.656882 L410.296548,317.368492 C409.836305,317.82955 409.09071,317.82955 408.630467,317.368492 C408.170797,316.90686 408.170797,316.159016 408.630467,315.697384 L411.333919,312.985774 L408.630467,310.274164 C408.197665,309.808287 408.210436,309.082301 408.659354,308.632029 C409.108271,308.181756 409.832073,308.168947 410.296548,308.603055 L413,311.314665 L415.703452,308.603055 C416.167927,308.168947 416.891729,308.181756 417.340646,308.632029 C417.789564,309.082301 417.802335,309.808287 417.369533,310.274164 L414.666081,312.985774 L417.369533,315.697384 Z"
										id="Shape"
									></path>
								</g>
							</g>
						</svg>
					</div>
					{getStepContent(activeStep)}
				</div>
			</div>
		</div>
	);
};

MintOverlay.propTypes = {
	reloadLandStatefromApi: PropTypes.func,
	userProvider: PropTypes.object,
	mapProvider: PropTypes.object,
	web3Provider: PropTypes.object,
	land: PropTypes.object,
	className: PropTypes.string,
	url: PropTypes.string,
};

export default withUserContext(withWeb3Context(withMapContext(MintOverlay)));
