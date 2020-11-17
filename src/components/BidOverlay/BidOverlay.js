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
import { auctionBid } from '../../lib/api';

import Tooltip from '@material-ui/core/Tooltip';
import Help from '@material-ui/icons/Help';
import { useTranslation } from 'react-i18next'


const BidOverlay = (props) => {
	const { t, i18n } = useTranslation()
	const { participateBid, approveOvrTokens } = props.web3Provider.actions;
	const { lastTransaction, ovr, dai, tether, usdc, ico, perEth, perUsd, setupComplete } = props.web3Provider.state;
	const { hexId } = props.land;
	const { marketStatus } = props.land;

	const [bidValid, setBidValid] = useState(false);
	const [nextBid, setNextBid] = useState(10);
	const [activeStep, setActiveStep] = useState(0);
	const [metamaskMessage, setMetamaskMessage] = useState(t('MetamaskMessage.set.waiting'));
	const [bid, setBid] = useState(0);
	const [currentBid, setCurrentBid] = useState(props.currentBid);
	const [bidProjection, setBidProjection] = useState(0);
	const [bidProjectionCurrency, setBidProjectionCurrency] = useState('ovr');

	const [showOverlay, setShowOverlay] = useState(false);
	const [classShowOverlay, setClassShowOverlay] = useState(false);

	const anchorRef = React.useRef(null);
	const [open, setOpen] = React.useState(false);

	function setDeactiveOverlay(e) {
		e.preventDefault();
		props.mapProvider.actions.changeActiveBidOverlay(false);
		// Bring the step at 0
		setTimeout(function () {
			setOpen(false);
			setActiveStep(0);
			setBid(0);
			setBidProjectionCurrency('ovr');
			setBidValid(false);
		}, 500);
	}

	// Listener for fadein and fadeout animation of overlay
	useEffect(() => {
		if (props.mapProvider.state.activeBidOverlay) {
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
	}, [props.mapProvider.state.activeBidOverlay]);

	useEffect(() => {
		updateBidProjectionCurrency(bidProjectionCurrency);
	}, [bid]);

	// Init helpers web3
	useEffect(() => {
		if (setupComplete) setNextBidSelectedLand();
	}, [setupComplete, ico, ovr, hexId, marketStatus, props.currentBid]);

	const setNextBidSelectedLand = async () => {
		if (!setupComplete || !ico || !ovr) {
			return warningNotification(t('Warning.metamask.not.detected.title'), t('Warning.metamask.not.detected.desc'));
		}
		// const landId = parseInt(hexId, 16);
		// const land = await ico.landsAsync(landId);
		// const currentBid = String(window.web3.fromWei(land[2]));

		setCurrentBid(props.currentBid);
		setNextBid(props.currentBid * 2);
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
		if (myBid >= nextBid) {
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
			warningNotification(t('Warning.invalid.auth.title'), t('Warning.invalid.auth.desc'));
			return false;
		}
		return true;
	};

	// Change the bid projection on selection
	const updateBidProjectionCurrency = (type) => {
		setBidProjection(bid);
		setBidProjectionCurrency('ovr');
		// switch (type) {
		// 	case 'ovr':
		// 		setBidProjection(bid);
		// 		setBidProjectionCurrency('ovr');
		// 		break;
		// 	case 'eth':
		// 		setBidProjection(((1 / perEth) * (bid / 10) * 2).toFixed(4));
		// 		setBidProjectionCurrency('eth');
		// 		break;
		// 	case 'usdt':
		// 		setBidProjection((bid / 10) * 2);
		// 		setBidProjectionCurrency('usdt');
		// 		break;
		// 	case 'usdc':
		// 		setBidProjection((bid / 10) * 2);
		// 		setBidProjectionCurrency('usdc');
		// 		break;
		// 	case 'dai':
		// 		setBidProjection((bid / 10) * 2);
		// 		setBidProjectionCurrency('dai');
		// 		break;
		// }
	};

	const participateInAuction = async (type) => {
		if (bid < nextBid)
			return warningNotification(t('Warning.invalid.bid.title'), t('Warning.invalid.bid.desc'));
		if (!checkUserLoggedIn()) return;

		// Centralized
		setActiveStep(2);
		auctionBid(hexId, bid)
		.then((response) => {
			if (response.data.result === true) {
				console.log('sendConfirmAuctionStart - response true', response.data);
			} else {
				// console.log('responseFalse');
				console.log('sendConfirmAuctionStart - response false', response.data.errors[0].message);
				// setActiveStep(0);
			}
		})
		.catch((error) => {
			console.log(error);
		});

		// Decentralized
		// setActiveStep((prevActiveStep) => prevActiveStep + 1);
		// try {
		// 	switch (type) {
		// 		case 'eth':
		// 			setMetamaskMessage(t('MetamaskMessage.set.participate.eth'));
		// 			await participateBid(0, bid, hexId);
		// 			break;
		// 		case 'dai':
		// 			setMetamaskMessage(t('MetamaskMessage.set.approve.dai'));
		// 			await approveOvrTokens(true, dai);
		// 			setMetamaskMessage(t('MetamaskMessage.set.participate.dai'));
		// 			await participateBid(1, bid, hexId);
		// 			break;
		// 		case 'usdt':
		// 			setMetamaskMessage(t('MetamaskMessage.set.approve.usdt'));
		// 			await approveOvrTokens(true, tether);
		// 			setMetamaskMessage(t('MetamaskMessage.set.participate.usdt'));
		// 			await participateBid(2, bid, hexId);
		// 			break;
		// 		case 'usdc':
		// 			setMetamaskMessage(t('MetamaskMessage.set.approve.usdc'));
		// 			await approveOvrTokens(true, usdc);
		// 			setMetamaskMessage(t('MetamaskMessage.set.participate.usdc'));
		// 			await participateBid(3, bid, hexId);
		// 			break;
		// 		case 'ovr':
		// 			setMetamaskMessage(t('MetamaskMessage.set.approve.ovr'));
		// 			await approveOvrTokens(true, ovr);
		// 			setMetamaskMessage(t('MetamaskMessage.set.participate.ovr'));
		// 			await participateBid(4, bid, hexId);
		// 			break;
		// 	}
		// } catch (e) {
		// 	setOpen(false);
		// 	setActiveStep(0);
		// 	return dangerNotification(t('Danger.error.processing.title'), e.message);
		// }
		// setActiveStep(2);
	};

	function getStepContent(step) {
		switch (step) {
			case 0:
				return (
					<div className="Overlay__body_cont">
						<div className="Overlay__upper">
							<div className="Overlay__title">{t('BidOverlay.place.bid')}</div>
							<div className="Overlay__land_title">{props.land.name.sentence}</div>
							<div className="Overlay__land_hex">{props.land.location}</div>
						</div>
						<div className="Overlay__lower">
							{/* <div className="Overlay__currency_cont">
								<div className="c-currency-selector_cont">
									<div
										className={`c-currency-selector ${bidProjectionCurrency == 'ovr' ? '--selected' : ' '}`}
										onClick={() => updateBidProjectionCurrency('ovr')}
									>
										{t('Currency.ovr.label')}
									</div>
									<div
										className={`c-currency-selector ${bidProjectionCurrency == 'eth' ? '--selected' : ' '}`}
										onClick={() => updateBidProjectionCurrency('eth')}
									>
										{t('Currency.eth.label')}
									</div>
									<div
										className={`c-currency-selector ${bidProjectionCurrency == 'dai' ? '--selected' : ' '}`}
										onClick={() => updateBidProjectionCurrency('dai')}
									>
										{t('Currency.dai.label')}
									</div>
									<div
										className={`c-currency-selector ${bidProjectionCurrency == 'usdt' ? '--selected' : ' '}`}
										onClick={() => updateBidProjectionCurrency('usdt')}
									>
										{t('Currency.usdt.label')}
									</div>
									<div
										className={`c-currency-selector ${bidProjectionCurrency == 'usdc' ? '--selected' : ' '}`}
										onClick={() => updateBidProjectionCurrency('usdc')}
									>
										{t('Currency.usdc.label')}
									</div>
								</div>
							</div> */}
							<div className="Overlay__bids_container">
								<div className="Overlay__bid_container">
									<div className="Overlay__current_bid">
										<div className="Overlay__bid_title">{t('BidOverlay.current.bid')}</div>
										<div className="Overlay__bid_cont">
											<ValueCounter value={currentBid}></ValueCounter>
										</div>
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
									<div className="Overlay__bid_title">{t('BidOverlay.min.bid')}</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={nextBid}></ValueCounter>
									</div>
								</div>
							</div>
							<div className="Overlay__your_bid">
								<div className="Overlay__bid_title">{t('BidOverlay.your.bid')}</div>
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
							<div className="Overlay__expense_projection">
								{bid >= 10 &&
									props.userProvider.state.isLoggedIn &&
									'Bid using ' + bidProjection + ' ' + bidProjectionCurrency}
								{bid >= 10 && props.userProvider.state.isLoggedIn && (
									<Tooltip
										title={
											<React.Fragment>
												{t('BidOverlay.use.direct')}
												<br></br>
												{t('BidOverlay.click.to.buy')}
											</React.Fragment>
										}
										aria-label="info"
										placement="bottom"
									>
										<a href={'https://www.ovr.ai'} rel="noopener noreferrer" target={'_blank'}>
											<Help className="Help" />
										</a>
									</Tooltip>
								)}
							</div>
							<div className="Overlay__buttons_container">
								<HexButton
									url="#"
									text={t('BidOverlay.place.bid.label')}
									className={`--orange ${bidValid ? '' : '--disabled'}`}
									ariaControls={open ? 'mint-fade-menu' : undefined}
									ariaHaspopup="true"
									onClick={() => participateInAuction(bidProjectionCurrency)}
								></HexButton>
								<HexButton url="#" text={t('Generic.cancel.label')} className="--orange-light" onClick={setDeactiveOverlay}></HexButton>
							</div>
						</div>
					</div>
				);
			case 1:
				return (
					<div className="Overlay__body_cont">
						<div className="Overlay__upper">
							<div className="Overlay__title">{t('BidOverlay.bidding.land')}</div>
							<div className="Overlay__land_title">{props.land.name.sentence}</div>
							<div className="Overlay__land_hex">{props.land.location}</div>
						</div>
						<div className="Overlay__lower">
							<div className="Overlay__bid_container">
								<div className="Overlay__current_bid">
									<div className="Overlay__bid_title">{t('BidOverlay.current.bid')}</div>
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
									<div className="Overlay__bid_title">{t('BidOverlay.your.bid')}</div>
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
								<span>{t('Generic.congrats.label')}</span>
								<br></br>{t('BidOverlay.request.sent')}
								<div className="Overlay__etherscan_link">
									<a href={config.apis.etherscan + '/tx/' + lastTransaction} rel="noopener noreferrer" target="_blank">
										{t('BidOverlay.view.status')}
									</a>
								</div>
							</div>
							<div className="Overlay__land_title">{props.land.name.sentence}</div>
							<div className="Overlay__land_hex">{props.land.location}</div>
						</div>
						<div className="Overlay__lower">
							<div className="Overlay__bid_container">
								<div className="Overlay__current_bid">
									<div className="Overlay__bid_title">Your bid</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={bid}></ValueCounter>
									</div>
								</div>
							</div>
							<div className="Overlay__close-button_container">
								<HexButton url="#" text={t('Generic.close.label')} className="--orange-light" onClick={setDeactiveOverlay}></HexButton>
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
				key="bid-overlay-"
				to={props.url}
				className={`RightOverlay BidOverlay NormalInputs ${
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

BidOverlay.propTypes = {
	currentBid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	reloadLandStatefromApi: PropTypes.func,
	userProvider: PropTypes.object,
	mapProvider: PropTypes.object,
	web3Provider: PropTypes.object,
	land: PropTypes.object,
	className: PropTypes.string,
	url: PropTypes.string,
};

export default withUserContext(withWeb3Context(withMapContext(BidOverlay)));
