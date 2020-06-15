import React, { useState, useEffect } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6
import { withMapContext } from '../../context/MapContext';
import { withUserContext } from '../../context/UserContext';
import ValueCounter from '../ValueCounter/ValueCounter';
import HexButton from '../HexButton/HexButton';
import { successNotification, warningNotification, dangerNotification } from '../../lib/notifications';

const BuyLandOverlay = (props) => {
	const { approveOvrTokens, buy, buyLand } = props.userProvider.actions;
	const pathHexId = window.location.pathname.split('/')[3];
	const [hexId, setHexId] = useState(pathHexId && pathHexId.length === 15 ? pathHexId : props.mapProvider.state.hex_id);
	const { ovr, ico, setupComplete } = props.userProvider.state;
	const [nextBid, setNextBid] = useState(10);
	const [activeStep, setActiveStep] = useState(0);
	const [metamaskMessage, setMetamaskMessage] = useState('Waiting for MetaMask confirmation');

	useEffect(() => {
		if (setupComplete) setupListeners();
	}, [setupComplete]);

	const setupListeners = () => {
		setNextBidSelectedLand(hexId);
		document.addEventListener('land-selected', (event) => {
			setHexId(event.detail.hex_id);
			setNextBidSelectedLand(event.detail.hex_id);
		});
	};

	const setNextBidSelectedLand = async () => {
		if (!setupComplete || !ico || !ovr) {
			return warningNotification('Metamask not detected', 'You must login to metamask to use this application');
		}
		const landId = parseInt(hexId, 16);
		const land = await ico.landsAsync(landId);
		const price = String(window.web3.fromWei(land[7]));
		setNextBid(price);
	};

	const handleNext = async () => {
		if (activeStep + 1 === 1) {
			if (!props.userProvider.state.isLoggedIn) {
				setActiveStep(0);
				return warningNotification('Invalid authentication', 'Please Log In to partecipate');
			}

			try {
				let currentBalance = await ovr.balanceOfAsync(window.web3.eth.defaultAccount);
				if (!currentBalance.greaterThan(nextBid))
					return dangerNotification(
						'Balance insufficient',
						"You don't have enough tokens to buy that land get more and try again",
					);
				setMetamaskMessage('Approving tokens...');
				await approveOvrTokens();
				setMetamaskMessage('Waiting for land buying MetaMask confirmation');
				await buyLand(hexId);
				successNotification('Land purchased successfully!', "You completed the land purchase successfully and now it's yours the page will be updated automatically");
				setTimeout(() => {
					window.reload();
				}, 2e3);
			} catch (e) {
				console.log('Error', e);
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

	function getStepContent(step) {
		switch (step) {
			case 0:
				return (
					<div className="Overlay__body_cont">
						<div className="Overlay__upper">
							<div className="Overlay__title">Buy OVRLand</div>
							<div className="Overlay__land_title">{props.land.name.sentence}</div>
							<div className="Overlay__land_hex">{props.land.location}</div>
						</div>
						<div className="Overlay__lower">
							<div className="Overlay__bid_container">
								<div className="Overlay__minimum_bid">
									<div className="Overlay__bid_title">Price</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={nextBid}></ValueCounter>
									</div>
								</div>
							</div>
							<br />
							<div className="Overlay__buttons_container">
							<HexButton
									url="#"
									text="Buy With OVR"
									className="--orange"
									onClick={() => {
										setActiveStep((prevActiveStep) => prevActiveStep + 1);
										handleNext();
									}}
								></HexButton>
								<HexButton
									url="#"
									text="Buy With ETH"
									className="--orange"
									onClick={async () => {
										setMetamaskMessage('Getting OVR first...');
										setActiveStep((prevActiveStep) => prevActiveStep + 1);
										await buy(window.web3.toWei(nextBid), 'eth');
										handleNext();
									}}
								></HexButton>
								<HexButton
									url="#"
									text="Buy With DAI"
									className="--orange"
									onClick={async () => {
										setMetamaskMessage('Getting OVR first...');
										setActiveStep((prevActiveStep) => prevActiveStep + 1);
										await buy(window.web3.toWei(nextBid), 'dai');
										handleNext();
									}}
								></HexButton>
								<HexButton
									url="#"
									text="Buy With Tether"
									className="--orange"
									onClick={async () => {
										setMetamaskMessage('Getting OVR first...');
										setActiveStep((prevActiveStep) => prevActiveStep + 1);
										await buy(window.web3.toWei(nextBid), 'usdt');
										handleNext();
									}}
								></HexButton>
								<HexButton
									url="#"
									text="Buy With USDC"
									className="--orange"
									onClick={async () => {
										setMetamaskMessage('Getting OVR first...');
										setActiveStep((prevActiveStep) => prevActiveStep + 1);
										await buy(window.web3.toWei(nextBid), 'usdc');
										handleNext();
									}}
								></HexButton>
								{/* <HexButton
									url="#"
									text="Place Bid With Dollars"
									className="--orange"
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
							<div className="Overlay__title">Buying OVRLand</div>
							<div className="Overlay__land_title">{props.land.name.sentence}</div>
							<div className="Overlay__land_hex">{props.land.location}</div>
						</div>
						<div className="Overlay__lower">
							<div className="Overlay__bid_container">
								<div className="Overlay__minimum_bid">
									<div className="Overlay__bid_title">Price</div>
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
							<div className="Overlay__title">Buying OVRLand</div>
							<div className="Overlay__land_title">{props.land.name.sentence}</div>
							<div className="Overlay__land_hex">{props.land.location}</div>
						</div>
						<div className="Overlay__lower">
							<div className="Overlay__bid_container">
								<div className="Overlay__current_bid">
									<div className="Overlay__bid_title">Price</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={nextBid}></ValueCounter>
									</div>
								</div>
							</div>
							<div className="Overlay__message__container">
								<span>Land purchased successfully</span>
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

	if (!props.mapProvider.state.activeBuyOverlay) return null;

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
				key="buy-land-overlay-"
				to={props.url}
				className={`Overlay MintOverlay WhiteInputs ${
					props.className ? props.className : ''
				} --activeStep-${activeStep}`}
			>
				<div className="Overlay__cont">
					<div className={`Icon Overlay__close_button`} onClick={setDeactiveOverlay}>
						<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg">
							<g id="Dashboards" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" fill-opacity="0.5">
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
						<div className={`Icon Overlay__hex`}>
							<svg width="152px" height="176px" viewBox="0 0 152 176" version="1.1" xmlns="http://www.w3.org/2000/svg">
								<g id="Dashboards" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" fill-opacity="0.2">
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

export default withUserContext(withMapContext(BuyLandOverlay));
