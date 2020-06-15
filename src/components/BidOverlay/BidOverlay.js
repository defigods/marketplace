import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6
import { withMapContext } from '../../context/MapContext';
import { withUserContext } from '../../context/UserContext';
import ValueCounter from '../ValueCounter/ValueCounter';
import HexButton from '../HexButton/HexButton';
import { bidAuction } from '../../lib/api';
import { networkError, warningNotification, dangerNotification } from '../../lib/notifications';

const BidOverlay = (props) => {
	const [nextBid, setNextBid] = useState(10);
	const [bidInputError] = useState(false);
	const [bidValid, setBidValid] = useState(false);
	const [activeStep, setActiveStep] = useState(0);
	const [currentBid, setCurrentBid] = useState(props.currentBid);
	const { waitTx, buy, approveOvrTokens } = props.userProvider.actions;
	const pathHexId = window.location.pathname.split('/')[3];
	const [hexId, setHexId] = useState(pathHexId && pathHexId.length == 15 ? pathHexId : props.mapProvider.state.hex_id);
	const { ovr, ico, setupComplete } = props.userProvider.state;
	const [bid, setBid] = useState(0);
	const [metamaskMessage, setMetamaskMessage] = useState('Waiting for Metamask confirmation');
	let priceInterval = null; // Checks for price changes every half a second

	useEffect(() => {
		if (setupComplete) setupListeners();
	}, [setupComplete]);

	const setupListeners = () => {
		setNextBidSelectedLand();
		priceInterval = setInterval(() => {
			setNextBidSelectedLand();
		}, 5e2);
		document.addEventListener('land-selected', (event) => {
			setHexId(window.location.pathname.split('/')[3]);
			clearInterval(priceInterval);
			priceInterval = setInterval(() => {
				setNextBidSelectedLand();
			}, 5e2);
			setNextBidSelectedLand();
		});
	};

	const setNextBidSelectedLand = async () => {
		if (!setupComplete || !ico || !ovr) {
			return warningNotification('Metamask not detected', 'You must login to metamask to use this application');
		}
		setHexId(window.location.pathname.split('/')[3]);
		const landId = parseInt(hexId, 16);
		const land = await ico.landsAsync(landId);
		const currentBid = String(window.web3.fromWei(land[2]));
		setCurrentBid(currentBid);
		setNextBid(currentBid * 2);
	};

	const handleNext = async () => {
		if (bid < nextBid)
			return warningNotification('Invalid bid', 'Your bid must be equal or larger than the minimum bid');
		if (activeStep + 1 === 1) {
			if (!props.userProvider.state.isLoggedIn) {
				setActiveStep(0);
				return warningNotification('Invalid authentication', 'Please Log In to partecipate');
			}
			// Participate in the auction
			const landId = parseInt(hexId, 16);
			try {
				setMetamaskMessage('Approving OVR tokens...');
				await approveOvrTokens();
				const weiBid = String(window.web3.toWei(bid));
				const tx = await ico.participateInAuctionAsync(weiBid, landId, {
					gasPrice: window.web3.toWei(30, 'gwei'),
				});
				await waitTx(tx);
				setActiveStep(2);
			} catch (e) {
				return dangerNotification('Error processing the transaction', e.message);
			}
			sendBid();
		} else {
			setActiveStep((prevActiveStep) => prevActiveStep + 1);
		}
	};

	const updateNewBidValue = (myBid) => {
		if (myBid >= nextBid) {
			setBidValid(true);
		} else {
			setBidValid(false);
		}

		setBid(myBid);
	};

	function sendBid() {
		// Call API function
		bidAuction(props.land.key, nextBid)
			.then((response) => {
				if (response.data.result === true) {
					console.log('responseTrue', response.data);
					props.realodLandStatefromApi(props.land.key);
					setActiveStep(2);
				} else {
					// response.data.errors[0].message
					console.log('responseFalse');
					dangerNotification('Unable to place requested bid', response.data.errors[0].message);
					setActiveStep(0);
				}
			})
			.catch(() => {
				// Notify user if network error
				networkError();
			});
	}

	function setDeactiveOverlay(e) {
		e.preventDefault();
		props.mapProvider.actions.changeActiveBidOverlay(false);
		// Bring the step at 0
		setTimeout(function () {
			setActiveStep(0);
			setNextBid('');
		}, 200);
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
							<div className="Overlay__bid_container">
								<div className="Overlay__current_bid">
									<div className="Overlay__bid_title">Current bid</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={currentBid}></ValueCounter>
									</div>
								</div>
								<div className="Overlay__arrow">
									<div className="Icon">
										<svg
											width="10px"
											height="17px"
											viewBox="0 0 10 17"
											version="1.1"
											xmlns="http://www.w3.org/2000/svg"
										>
											<g id="Dashboards" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
												<g
													id="Biddign-Single-Auction"
													transform="translate(-792.000000, -469.000000)"
													fill="#FFFFFF"
													stroke="#D4CDD9"
												>
													<path
														d="M793.132554,484.641214 C793.210784,484.719949 793.317088,484.764519 793.428175,484.765159 C793.5396,484.7662 793.646532,484.721367 793.723796,484.641214 L800.694533,477.682613 C800.773611,477.604705 800.818124,477.498417 800.818124,477.387507 C800.818124,477.276596 800.773611,477.170308 800.694533,477.0924 L793.723796,470.132323 C793.61943,470.02095 793.462544,469.975232 793.314547,470.013063 C793.16655,470.050895 793.050984,470.16626 793.013086,470.313999 C792.975188,470.461739 793.020987,470.618352 793.132554,470.722535 L799.807671,477.387507 L793.132554,484.051002 C793.053844,484.129106 793.009585,484.23532 793.009585,484.346108 C793.009585,484.456896 793.053844,484.56311 793.132554,484.641214 Z"
														id="Path"
													></path>
												</g>
											</g>
										</svg>
									</div>
								</div>
								<div className="Overlay__minimum_bid">
									<div className="Overlay__bid_title">Minimum bid</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={nextBid}></ValueCounter>
									</div>
								</div>
								<div className="Overlay__minimum_bid">
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
							<div className="Overlay__buttons_container">
								<HexButton
									url="#"
									text="Place Bid With OVR"
									className={`--orange ${bidValid ? '' : '--disabled'}`}
									onClick={() => {
										setActiveStep((prevActiveStep) => prevActiveStep + 1);
										handleNext();
									}}
								></HexButton>
								<HexButton
									url="#"
									text="Place Bid With ETH"
									className={`--orange ${bidValid ? '' : '--disabled'}`}
									onClick={async () => {
										setMetamaskMessage('Getting OVR first...');
										setActiveStep((prevActiveStep) => prevActiveStep + 1);
										await buy(window.web3.toWei(bid), 'eth');
										handleNext();
									}}
								></HexButton>
								<HexButton
									url="#"
									text="Place Bid With DAI"
									className={`--orange ${bidValid ? '' : '--disabled'}`}
									onClick={async () => {
										setMetamaskMessage('Getting OVR first...');
										setActiveStep((prevActiveStep) => prevActiveStep + 1);
										await buy(window.web3.toWei(bid), 'dai');
										handleNext();
									}}
								></HexButton>
								<HexButton
									url="#"
									text="Place Bid With Tether"
									className={`--orange ${bidValid ? '' : '--disabled'}`}
									onClick={async () => {
										setMetamaskMessage('Getting OVR first...');
										setActiveStep((prevActiveStep) => prevActiveStep + 1);
										await buy(window.web3.toWei(bid), 'usdt');
										handleNext();
									}}
								></HexButton>
								<HexButton
									url="#"
									text="Place Bid With USDC"
									className={`--orange ${bidValid ? '' : '--disabled'}`}
									onClick={async () => {
										setMetamaskMessage('Getting OVR first...');
										setActiveStep((prevActiveStep) => prevActiveStep + 1);
										await buy(window.web3.toWei(bid), 'usdc');
										handleNext();
									}}
								></HexButton>
								{/* <HexButton
									url="#"
									text="Place Bid With Dollars"
									className={`--orange ${bidValid ? '' : '--disabled'}`}
									onClick={handleNext}
								></HexButton> */}
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
								<div className="Overlay__current_bid">
									<div className="Overlay__bid_title">Current bid</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={currentBid}></ValueCounter>
									</div>
								</div>
								<div className="Overlay__arrow">
									<div className="Icon">
										<svg
											width="10px"
											height="17px"
											viewBox="0 0 10 17"
											version="1.1"
											xmlns="http://www.w3.org/2000/svg"
										>
											<g id="Dashboards" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
												<g
													id="Biddign-Single-Auction"
													transform="translate(-792.000000, -469.000000)"
													fill="#FFFFFF"
													stroke="#D4CDD9"
												>
													<path
														d="M793.132554,484.641214 C793.210784,484.719949 793.317088,484.764519 793.428175,484.765159 C793.5396,484.7662 793.646532,484.721367 793.723796,484.641214 L800.694533,477.682613 C800.773611,477.604705 800.818124,477.498417 800.818124,477.387507 C800.818124,477.276596 800.773611,477.170308 800.694533,477.0924 L793.723796,470.132323 C793.61943,470.02095 793.462544,469.975232 793.314547,470.013063 C793.16655,470.050895 793.050984,470.16626 793.013086,470.313999 C792.975188,470.461739 793.020987,470.618352 793.132554,470.722535 L799.807671,477.387507 L793.132554,484.051002 C793.053844,484.129106 793.009585,484.23532 793.009585,484.346108 C793.009585,484.456896 793.053844,484.56311 793.132554,484.641214 Z"
														id="Path"
													></path>
												</g>
											</g>
										</svg>
									</div>
								</div>
								<div className="Overlay__minimum_bid">
									<div className="Overlay__bid_title">Your bid</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={nextBid}></ValueCounter>
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
							<div className="Overlay__title">Bidding the OVRLand</div>
							<div className="Overlay__land_title">{props.land.name.sentence}</div>
							<div className="Overlay__land_hex">{props.land.location}</div>
						</div>
						<div className="Overlay__lower">
							<div className="Overlay__bid_container">
								<div className="Overlay__current_bid">
									<div className="Overlay__bid_title">Current bid</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={currentBid}></ValueCounter>
									</div>
								</div>
							</div>
							<div className="Overlay__message__container">
								<span>Transaction confirmed</span>
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

	if (!props.mapProvider.state.activeBidOverlay) return null;

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
				key="bid-overlay-"
				to={props.url}
				className={`Overlay BidOverlay WhiteInputs ${
					props.className ? props.className : ''
				} --activeStep-${activeStep}`}
			>
				<div className="Overlay__cont">
					<div className={'Icon Overlay__close_button'} onClick={setDeactiveOverlay}>
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
						<div className={'Icon Overlay__hex'}>
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

export default withUserContext(withMapContext(BidOverlay));
