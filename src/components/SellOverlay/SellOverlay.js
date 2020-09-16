import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { withMapContext } from '../../context/MapContext';
import { withUserContext } from '../../context/UserContext';
import { withWeb3Context } from '../../context/Web3Context';
import ValueCounter from '../ValueCounter/ValueCounter';
import HexButton from '../HexButton/HexButton';
import { networkError, warningNotification, dangerNotification } from '../../lib/notifications';
import { sellLand } from '../../lib/api';
import PropTypes from 'prop-types';

const SellOverlay = (props) => {
	const { approveErc721Token, putLandOnSale } = props.web3Provider.actions;
	const { ico, setupComplete } = props.web3Provider.state;

	const { hexId } = props.land;
	const { marketStatus } = props.land;

	const [boughtAt, setBoughtAt] = useState(props.currentBid);
	const [sellWorth, setNewSellWorth] = useState(props.currentBid);
	const [bidValid, setBidValid] = useState(false);
	const [activeStep, setActiveStep] = useState(0);
	const [metamaskMessage, setMetamaskMessage] = useState('Waiting for MetaMask confirmation');
	const [showOverlay, setShowOverlay] = useState(false);
	const [classShowOverlay, setClassShowOverlay] = useState(false);

	// Listener for fadein and fadeout animation of overlay
	useEffect(() => {
		if (props.mapProvider.state.activeSellOverlay) {
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
	}, [props.mapProvider.state.activeSellOverlay]);

	// Init helpers web3
	useEffect(() => {
		if (setupComplete) setNextBidSelectedLand();
	}, [setupComplete, ico, hexId, marketStatus]);

	const setNextBidSelectedLand = async () => {
		if (!setupComplete || !ico) {
			return warningNotification('Metamask not detected', 'You must login to metamask to use this application');
		}
		const landId = parseInt(hexId, 16);
		const land = await ico.landsAsync(landId);
		const paid = String(window.web3.fromWei(land[2]));
		setBoughtAt(paid);
	};

	// Update bid value in state
	const updateNewSellWorth = (sellAt) => {
		if (sellAt === '') {
			setBidValid(false);
		} else {
			setBidValid(true);
		}
		setNewSellWorth(sellAt);
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

	// Manages actions of overlay according to step number
	const handleNext = async () => {
		if (activeStep + 1 === 1) {
			if (checkUserLoggedIn() === false) {
				return false;
			} else {
				setActiveStep((prevActiveStep) => prevActiveStep + 1);
				try {
					setMetamaskMessage('Approving ERC721 token for the Smart Contract...');
					await approveErc721Token(hexId);
					setMetamaskMessage('Waiting for MetaMask confirmation');
					await putLandOnSale(hexId, String(window.web3.toWei(sellWorth)), true);
					// TODO Centralized flux
				} catch (e) {
					return dangerNotification('Error processing the transactions', e.message);
				}
				sendSell();
			}
		} else {
			setActiveStep((prevActiveStep) => prevActiveStep + 1);
		}
	};

	// Call centralized API functions
	function sendSell() {
		sellLand(props.land.key, sellWorth)
			.then((response) => {
				if (response.data.result === true) {
					// console.log('responseTrue', response.data);
					props.reloadLandStatefromApi(props.land.key);
					setActiveStep(2);
				} else {
					// response.data.errors[0].message
					// console.log('responseFalse');
					dangerNotification('Unable to place sell request', response.data.errors[0].message);
				}
			})
			.catch(() => {
				// Notify user if network error
				networkError();
			});
	}

	function setDeactiveOverlay(e) {
		e.preventDefault();
		props.mapProvider.actions.changeActiveSellOverlay(false);
		// Bring the step at 0
		setTimeout(function () {
			setActiveStep(0);
			setNewSellWorth('');
		}, 200);
	}

	// Show content of overlay according to step number
	function getStepContent(step) {
		switch (step) {
			case 0:
				return (
					<div className="Overlay__body_cont">
						<div className="Overlay__upper">
							<div className="Overlay__title">Create sell offer for</div>
							<div className="Overlay__land_title">{props.land.name.sentence}</div>
							<div className="Overlay__land_hex">{props.land.location}</div>
						</div>
						<div className="Overlay__lower">
							<div className="Overlay__bids_container">
								<div className="Overlay__bid_container">
									<div className="Overlay__minimum_bid">
										<div className="Overlay__bid_title">Bought at</div>
										<div className="Overlay__bid_cont">
											<ValueCounter value={boughtAt}></ValueCounter>
										</div>
									</div>
								</div>
								<div className="Overlay__minimum_bid my-bid">
									<div className="Overlay__bid_title">Sell at</div>
									<div>
										<TextField
											type="number"
											onChange={(e) => {
												updateNewSellWorth(e.target.value);
											}}
										/>
									</div>
								</div>
							</div>
							<br></br>
							<div className="Overlay__buttons_container">
								<HexButton
									url="#"
									text="Place Sell"
									className={`--purple ${bidValid ? '' : '--disabled'}`}
									onClick={handleNext}
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
							<div className="Overlay__title">Create sell offer for</div>
							<div className="Overlay__land_title">{props.land.name.sentence}</div>
							<div className="Overlay__land_hex">{props.land.location}</div>
						</div>
						<div className="Overlay__lower">
							<div className="Overlay__bid_container">
								<div className="Overlay__current_bid">
									<div className="Overlay__bid_title">Bought at</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={boughtAt}></ValueCounter>
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
									<div className="Overlay__bid_title">Selling at</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={sellWorth}></ValueCounter>
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
								<br></br>Sell order placed
							</div>
							<div className="Overlay__land_title">{props.land.name.sentence}</div>
							<div className="Overlay__land_hex">{props.land.location}</div>
						</div>
						<div className="Overlay__lower">
							<div className="Overlay__bid_container">
								<div className="Overlay__current_bid">
									<div className="Overlay__bid_title">Bought at</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={boughtAt}></ValueCounter>
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
									<div className="Overlay__bid_title">Selling at</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={sellWorth}></ValueCounter>
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
				key="sell-overlay-"
				to={props.url}
				className={`RightOverlay SellOverlay NormalInputs ${
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

SellOverlay.propTypes = {
	props: PropTypes.object,
	reloadLandStatefromApi: PropTypes.func,
	userProvider: PropTypes.object,
	mapProvider: PropTypes.object,
	web3Provider: PropTypes.object,
	land: PropTypes.object,
	className: PropTypes.string,
	url: PropTypes.string,
};

export default withUserContext(withWeb3Context(withMapContext(SellOverlay)));
