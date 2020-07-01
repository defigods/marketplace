import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { withMapContext } from '../../context/MapContext';
import { withUserContext } from '../../context/UserContext';
import { withWeb3Context } from '../../context/Web3Context';
import ValueCounter from '../ValueCounter/ValueCounter';
import HexButton from '../HexButton/HexButton';
import { auctionConfirmStart, auctionPreStart } from '../../lib/api';
import { networkError, warningNotification, dangerNotification } from '../../lib/notifications';
import PropTypes from 'prop-types';

import MenuItem from '@material-ui/core/MenuItem';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';

const MintOverlay = (props) => {
	const { waitTxWithCallback, buy, approveOvrTokens } = props.web3Provider.actions;
	const { ovr, ico, setupComplete } = props.web3Provider.state;

	const [bidValid, setBidValid] = useState(false);
	const pathHexId = window.location.pathname.split('/')[3];
	const [hexId, setHexId] = useState(pathHexId && pathHexId.length === 15 ? pathHexId : props.mapProvider.state.hex_id);
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
		if (setupComplete) setupListeners();
	}, [setupComplete]);

	const setupListeners = () => {
		document.addEventListener('land-selected', (event) => {
			setHexId(event.detail.hex_id);
			setNextBidSelectedLand(event.detail.hexId);
		});
	};

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

	// Call centralized API functions
	function sendPreAuctionStart(txHash) {
		auctionPreStart(props.land.key, bid, txHash)
			.then((response) => {
				console.log('response', response.data);
			})
			.catch((error) => {
				// Notify user if network error
				console.log(error);
				networkError();
			});
	}

	function sendConfirmAuctionStart(txHash) {
		auctionConfirmStart(props.land.key, txHash)
			.then((response) => {
				if (response.data.result === true) {
					console.log('responseTrue', response.data);
					props.reloadLandStatefromApi(props.land.key);
					console.log('props.land.key', props);
				} else {
					// response.data.errors[0].message
					console.log('responseFalse');
					// if (response.data.errors){
					//   dangerNotification("Unable to mint land", response.data.errors[0].message)
					// }
					dangerNotification('Unable to mint land', response.data.errors[0].message);
					setActiveStep(0);
				}
			})
			.catch((error) => {
				// Notify user if network error
				console.log(error);
				networkError();
			});
	}

	// Manages actions of overlay according to step number
	const handleNext = async () => {
		if (bid < nextBid)
			return warningNotification('Invalid bid', 'Your bid must be equal or larger than the minimum bid');
		if (activeStep + 1 === 1) {
			if (checkUserLoggedIn() === false) {
				return false;
			}
			// Participate in the auction
			const landId = parseInt(hexId, 16);
			const isAvailableInThisEpoch = await ico.checkEpochAsync(landId);
			if (!isAvailableInThisEpoch) {
				return warningNotification('Epoch issue', 'The current land is not available in this epoch');
			}

			try {
				setMetamaskMessage('Approving OVR tokens...');
				await approveOvrTokens();
				await ico.initialLandBidAsync();
				let currentBalance = await ovr.balanceOfAsync(window.web3.eth.defaultAccount);
				const weiBid = String(window.web3.toWei(bid));

				// Check if the user has enough balance to buy those tokens
				if (currentBalance.lessThan(weiBid)) {
					setActiveStep(0);
					return warningNotification('Not enough tokens', `You don't have enough to pay ${weiBid} OVR tokens`);
				}
				const tx = await ico.participateInAuctionAsync(weiBid, landId, {
					gasPrice: window.web3.toWei(30, 'gwei'),
				});
				sendPreAuctionStart(tx);
				setActiveStep(2);
				waitTxWithCallback(tx, sendConfirmAuctionStart);
				// sendConfirmAuctionStart();
			} catch (e) {
				setActiveStep((prevActiveStep) => prevActiveStep - 1);
				return dangerNotification('Error processing the transactions', e.message);
			}
		} else {
			setActiveStep((prevActiveStep) => prevActiveStep + 1);
		}
	};

	// Show content of overlay according to step number
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
													<MenuList autoFocusItem={open} id="fade-menu">
														<MenuItem
															onClick={(e) => {
																handleClose(e);
																setActiveStep((prevActiveStep) => prevActiveStep + 1);
																handleNext();
															}}
															className="bid-fade-menu --cons-option"
														>
															Bid using OVR
														</MenuItem>
														<MenuItem
															onClick={async (e) => {
																handleClose(e);
																if (checkUserLoggedIn() === false) {
																	return false;
																}
																setActiveStep((prevActiveStep) => prevActiveStep + 1);
																await buy(window.web3.toWei(bid), 'eth');
																handleNext();
															}}
															className="bid-fade-menu"
														>
															Bid using ETH
														</MenuItem>
														<MenuItem
															onClick={async (e) => {
																handleClose(e);
																setMetamaskMessage('Getting OVR first...');
																if (checkUserLoggedIn() === false) {
																	return false;
																}
																setActiveStep((prevActiveStep) => prevActiveStep + 1);
																await buy(window.web3.toWei(bid), 'dai');
																handleNext();
															}}
															className="bid-fade-menu"
														>
															Bid using DAI
														</MenuItem>
														<MenuItem
															onClick={async (e) => {
																handleClose(e);
																setMetamaskMessage('Getting OVR first...');
																if (checkUserLoggedIn() === false) {
																	return false;
																}
																setActiveStep((prevActiveStep) => prevActiveStep + 1);
																await buy(window.web3.toWei(bid), 'usdt');
																handleNext();
															}}
															className="bid-fade-menu"
														>
															Bid using Tether
														</MenuItem>
														<MenuItem
															onClick={async (e) => {
																handleClose(e);
																setMetamaskMessage('Getting OVR first...');
																if (checkUserLoggedIn() === false) {
																	return false;
																}
																setActiveStep((prevActiveStep) => prevActiveStep + 1);
																await buy(window.web3.toWei(bid), 'usdc');
																handleNext();
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
									ariaControls={open ? 'fade-menu' : undefined}
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
