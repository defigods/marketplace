import React, { useState, useEffect } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6
import TextField from '@material-ui/core/TextField';
import { withMapContext } from '../../context/MapContext';
import { withUserContext } from '../../context/UserContext';
import ValueCounter from '../ValueCounter/ValueCounter';
import HexButton from '../HexButton/HexButton';
import { auctionConfirmStart, auctionPreStart } from '../../lib/api';
import { networkError, warningNotification, dangerNotification } from '../../lib/notifications';
import PropTypes from 'prop-types';

import Fade from '@material-ui/core/Fade';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const MintOverlay = (props) => {
	const { waitTx, buy, approveOvrTokens } = props.userProvider.actions;
	const [bidValid, setBidValid] = useState(false);
	const pathHexId = window.location.pathname.split('/')[3];
	const [hexId, setHexId] = useState(pathHexId && pathHexId.length === 15 ? pathHexId : props.mapProvider.state.hex_id);
	const { ovr, ico, setupComplete } = props.userProvider.state;
	const [nextBid, setNextBid] = useState(10);
	const [activeStep, setActiveStep] = useState(0);
	const [metamaskMessage, setMetamaskMessage] = useState('Waiting for MetaMask confirmation');
	const [bid, setBid] = useState(0);

	const [anchorEl, setAnchorEl] = React.useState(null);
	const open = Boolean(anchorEl);

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

	// Menu currencies
	const handleClose = () => {
		setAnchorEl(null);
	};
	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const updateNewBidValue = (myBid) => {
		if (myBid >= nextBid && myBid >= 10) {
			setBidValid(true);
		} else {
			setBidValid(false);
		}

		setBid(myBid);
	};

	const checkUserLoggedIn = () => {
		if (!props.userProvider.state.isLoggedIn) {
			setActiveStep(0);
			warningNotification('Invalid authentication', 'Please Log In to partecipate');
			return false;
		}
		return true;
	};

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
				sendPreAuctionStart();
				const tx = await ico.participateInAuctionAsync(weiBid, landId, {
					gasPrice: window.web3.toWei(30, 'gwei'),
				});
				setMetamaskMessage('Waiting for MetaMask confirmation');
				await waitTx(tx);
				sendConfirmAuctionStart();
			} catch (e) {
				setActiveStep((prevActiveStep) => prevActiveStep - 1);
				return dangerNotification('Error processing the transactions', e.message);
			}
		} else {
			setActiveStep((prevActiveStep) => prevActiveStep + 1);
		}
	};

	function setDeactiveOverlay(e) {
		e.preventDefault();
		props.mapProvider.actions.changeActiveMintOverlay(false);
		setActiveStep(0);
	}

	function sendPreAuctionStart() {
		auctionPreStart(props.land.key, nextBid)
			.then((response) => {
				console.log('response', response.data);
			})
			.catch((error) => {
				// Notify user if network error
				console.log(error);
				networkError();
			});
	}

	function sendConfirmAuctionStart() {
		// Call API function
		auctionConfirmStart(props.land.key)
			.then((response) => {
				if (response.data.result === true) {
					console.log('responseTrue', response.data);
					props.realodLandStatefromApi(props.land.key);
					console.log('props.land.key', props);
					setActiveStep(2);
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

	function getStepContent(step) {
		switch (step) {
			case 0:
				return (
					<div className="Overlay__body_cont">
						<div className="Overlay__upper">
							<div className="Overlay__title">Place a bid for the OVRLand</div>
							<div className="Overlay__land_title">{props.land.name.sentence}</div>
							<div className="Overlay__land_hex">{props.land.location}</div>
						</div>
						<div className="Overlay__lower">
							<div className="bids">
								<div className="Overlay__bid_container">
									<div className="Overlay__minimum_bid">
										<div className="Overlay__bid_title">Min bid</div>
										<div className="Overlay__bid_cont">
											<ValueCounter value={nextBid}></ValueCounter>
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
								<Menu
									id="fade-menu"
									anchorEl={anchorEl}
									keepMounted
									open={open}
									onClose={handleClose}
									TransitionComponent={Fade}
								>
									<MenuItem
										onClick={() => {
											setActiveStep((prevActiveStep) => prevActiveStep + 1);
											handleNext();
											handleClose();
										}}
										className="bid-fade-menu --cons-option"
									>
										Bid using OVR
									</MenuItem>
									<MenuItem
										onClick={async () => {
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
										onClick={async () => {
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
										onClick={async () => {
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
										onClick={async () => {
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
								</Menu>
								{/* <HexButton
									url="#"
									text="Place Bid With Dollars"
									className={`--orange ${bidValid ? '' : '--disabled'}`}
									onClick={handleNext}
								></HexButton> */}
								<HexButton
									url="#"
									text="Place bid"
									className={`--orange ${bidValid ? '' : '--disabled'}`}
									onClick={handleClick}
								></HexButton>
								<HexButton url="#" text="Cancel" className="--outline" onClick={setDeactiveOverlay}></HexButton>
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
							<div className="Overlay__title">Minting the OVRLand</div>
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
							<div className="Overlay__message__container">
								<span>Bid published</span>
							</div>
							<div className="Overlay__buttons_container">
								<HexButton url="#" text="Close" className="--outline" onClick={setDeactiveOverlay}></HexButton>
							</div>
						</div>
					</div>
				);
			default:
				return 'Unknown step';
		}
	}

	if (!props.mapProvider.state.activeMintOverlay) return null;

	return (
		<ReactCSSTransitionGroup
			transitionName="overlay"
			transitionAppear={true}
			transitionAppearTimeout={500}
			transitionEnter={false}
			transitionLeave={false}
			transitionLeaveTimeout={300}
		>
			<div
				key="mint-overlay-"
				to={props.url}
				className={`Overlay MintOverlay WhiteInputs ${
					props.className ? props.className : ''
				} --activeStep-${activeStep}`}
			>
				<div className="Overlay__cont">
					<div className="Icon Overlay__close_button" onClick={setDeactiveOverlay}>
						<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg">
							<g id="Dashboards" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" fillOpacity="0.5">
								<g
									id="Biddign-Single-Auction"
									transform="translate(-398.000000, -298.000000)"
									fill="#FFFFFF"
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
					<div className="Overlay__hex_cont">
						<div className="Icon Overlay__hex">
							<svg width="152px" height="176px" viewBox="0 0 152 176" version="1.1" xmlns="http://www.w3.org/2000/svg">
								<g id="Dashboards" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" fillOpacity="0.2">
									<g
										id="Biddign-Single-Auction"
										transform="translate(-439.000000, -349.000000)"
										fill="#FFFFFF"
										stroke="#FFFFFF"
									>
										<polygon
											id="Polygon"
											transform="translate(515.000000, 437.000000) rotate(-360.000000) translate(-515.000000, -437.000000) "
											points="515 350 590.34421 393.5 590.34421 480.5 515 524 439.65579 480.5 439.65579 393.5"
										></polygon>
									</g>
								</g>
							</svg>
						</div>
					</div>
					{getStepContent(activeStep)}
				</div>
			</div>
		</ReactCSSTransitionGroup>
	);
};

MintOverlay.propTypes = {
	realodLandStatefromApi: PropTypes.func,
	userProvider: PropTypes.object,
	mapProvider: PropTypes.object,
	land: PropTypes.object,
	className: PropTypes.string,
	url: PropTypes.string,
};

export default withUserContext(withMapContext(MintOverlay));
