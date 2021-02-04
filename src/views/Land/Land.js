/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { withMapContext } from 'context/MapContext';
import { withUserContext } from 'context/UserContext';
import { withWeb3Context } from 'context/Web3Context';
import ValueCounter from 'components/ValueCounter/ValueCounter';
import TimeCounter from 'components/TimeCounter/TimeCounter';
import HexButton from 'components/HexButton/HexButton';
import BidOverlay from 'components/BidOverlay/BidOverlay';
import MintOverlay from 'components/MintOverlay/MintOverlay';
import SellOverlay from 'components/SellOverlay/SellOverlay';
import BuyOfferOverlay from 'components/BuyOfferOverlay/BuyOfferOverlay';
// import OpenSellOrder from 'components/OpenSellOrder/OpenSellOrder';
import BuyOfferOrder from 'components/BuyOfferOrder/BuyOfferOrder';
import BuyLandOverlay from 'components/BuyLandOverlay/BuyLandOverlay';
import CircularProgress from '@material-ui/core/CircularProgress';
import { warningNotification } from 'lib/notifications';

import { getLand, sendAuctionCheckClose } from 'lib/api';
import { networkError } from 'lib/notifications';
import PropTypes from 'prop-types';

import config from 'lib/config';
import { Textfit } from 'react-textfit';
import ActionCable from 'actioncable';
import { Trans, useTranslation } from 'react-i18next';

// import { ca } from 'date-fns/esm/locale';

const Land = (props) => {
	const { t, i18n } = useTranslation();

	const {
		changeHexId,
		changeLandData,
		changeActiveBidOverlay,
		changeActiveMintOverlay,
		changeActiveSellOverlay,
		changeActiveBuyOverlay,
		changeActiveBuyOfferOverlay,
	} = props.mapProvider.actions;
	const { mintLightMintedLand, getOffersToBuyLand, getUSDValueInOvr } = props.web3Provider.actions;
	const { ovr, ico, setupComplete } = props.web3Provider.state;
	const { isLoggedIn } = props.userProvider.state;

	const [hexId, setHexId] = useState(props.mapProvider.state);
	const [integerId, setIntegerId] = useState();
	const [value, setValue] = useState(10);
	const [marketStatus, setMarketStatus] = useState(0);
	const [userPerspective, setUserPerspective] = useState(0);
	const [name, setName] = useState({ sentence: 'director.connect.overflow', hex: '8cbcc350c0ab5ff' });
	const [location, setLocation] = useState('Venice, Italy');
	const [auction, setAuction] = useState(null);
	// const [openSellOrder, setOpenSellOrder] = useState(null);
	const [openBuyOffers, setOpenBuyOffers] = useState([]);
	const [mintTxHash, setMintTxHash] = useState(undefined);
	const [isRedeemingLand, setIsRedeemingLand] = useState(false);
	const [isNotValidH3, setIsNotValidH3] = useState(false);
	const [isUnavailable, setIsUnavailable] = useState(false);

	const getBuyOffers = async () => {
		let offers = await getOffersToBuyLand(hexId);
		setOpenBuyOffers(offers);
	};

	const decentralizedSetup = async () => {
		if (!setupComplete || !ico || !ovr) {
			return false;
		}
		getBuyOffers();
		// updateMarketStatusFromSmartContract(hexId);
		// setContractPrice(hexId);
	};

	// First load
	useEffect(() => {
		const hex_id = props.match.params.id;
		changeHexId(hex_id); // Focus map on hex_id
		loadLandStateFromApi(hex_id); // Load data from API
	}, [undefined, props.match.params.id]);

	// Sockets
	useEffect(() => {
		if (setupComplete && isLoggedIn && hexId === props.match.params.id) {
			// liveSocket(props.match.params.id);
			// console.log('LIVESOCKET', hexId);
			if (isLoggedIn) {
				// console.log('LIVESOCKET PASSED', hexId);
				if (window.landSocket) window.landSocket.unsubscribe(); // unsubscribe precedent land
				var cable = ActionCable.createConsumer(config.apis.socket);
				// console.log('hexId', hexId);
				window.landSocket = cable.subscriptions.create(
					{ channel: 'LandsChannel', hex_id: hexId },
					{
						received: (data) => {
							// console.log('LIVESOCKET data incoming', hexId);
							// console.log('LAND SOCKET data', data);
							loadLandStateFromApi(hexId);
							decentralizedSetup();
						},
					},
				);
			} else {
				// console.log('LIVESOCKET UHOH');
			}
		}
	}, [setupComplete, isLoggedIn, hexId]);

	// On change of decentralized setup, reload values
	useEffect(() => {
		if (setupComplete) decentralizedSetup();
	}, [setupComplete, ico, ovr, hexId, marketStatus]);

	// Call API function
	function loadLandStateFromApi(hex_id) {
		getLand(hex_id)
			.then((response) => {
				let data = response.data;
				// console.log('data', data);
				if (data.error && data.error == 'h3_not_valid') {
					setIsNotValidH3(true);
				} else {
					setIsNotValidH3(false);
					changeHexId(data.hexId);
					// Update state component
					setHexId(data.hexId);
					setIntegerId(data.intId);
					setName({ sentence: data.sentenceId, hex: data.hexId });
					setLocation(data.address.full);
					setUserPerspective(data.userPerspective);
					setAuction(data.auction);
					setIsUnavailable(data.isUnavailable);
					setMintTxHash(data.mintTxHash);
					// Centralized
					setValue(data.value);
					// If it's unminted take 10
					if (data.value < 50) {
						let val = getUSDValueInOvr(10);
						setValue(val);
					}
					setMarketStatus(data.marketStatus);
					if (data.auction) {
						if (data.auction.status === 1 && Date.parse(data.auction.closeAt) < Date.now()) {
							setMarketStatus(10);
						}
					}

					// If you are owner and land has been assigned give a check to land market status
					if (marketStatus === 11 && userPerspective == 1) {
						// commented because it's already recursive
						// updateLandMarketStatusIfHasBeenMinted(hexId).then((response) => {});
					}

					// Update state for MapContext
					let state = {
						key: data.hexId,
						name: { sentence: data.sentenceId, hex: data.hexId },
						location: data.address.full,
						userPerspective: data.userPerspective,
						openSellOrder: data.openSellOrder,
						auction: data.auction,
					};
					changeLandData(state);
				}
			})
			.catch((error) => {
				// Notify user if network error
				console.log(error);
				networkError();
			});
	}

	const updateMarketStatusFromSmartContract = async (hex_id) => {
		// Set 0 for not started, 1 for started and 2 for ended
		const landId = parseInt(hex_id, 16);
		const land = await ico.landsAsync(landId);

		const lastPaymentTimestamp = parseInt(land[3]);
		const landOwner = land[0];
		const auctionLandDuration = parseInt(await ico.auctionLandDurationAsync());
		// Check is the land is ended by comparing the timestamp to 24 hours
		const now = Math.trunc(Date.now() / 1000);
		const landContractState = parseInt(land[4]);
		const isOnSale = land[8];

		// Checks if the land is on sale also to display the right buy button
		if (isOnSale) {
			return setMarketStatus(4);
		}
		// If 24 hours have passed, consider it sold
		// Checks if you're the owner or not to display the appropriate button
		if (landContractState === 1 && now > lastPaymentTimestamp + auctionLandDuration) {
			return setMarketStatus(5); // Render redeem land button
		}

		if (landContractState === 2) {
			if (landOwner === window.web3.eth.defaultAccount) {
				return setMarketStatus(3);
			} else {
				return setMarketStatus(2);
			}
		} else {
			setMarketStatus(landContractState);
		}
	};

	// OLD //
	// const redeemLand = async (e) => {
	// 	e.preventDefault();
	// 	setIsRedeemingLand(true);
	// 	sendAuctionCheckClose(hexId);
	// 	await mintLightMintedLand(hexId);
	// 	setIsRedeemingLand(false);
	// };

	const redeemLand = async (e) => {
		e.preventDefault();
		let resultRedeem = await mintLightMintedLand(hexId);
	};

	function setActiveBidOverlay(e) {
		if (!isLoggedIn) {
			warningNotification(t('Warning.invalid.auth.title'), t('Warning.invalid.auth.desc'));
			return false;
		}
		e.preventDefault();
		changeActiveBidOverlay(true);
	}

	function setActiveMintOverlay(e) {
		if (!isLoggedIn) {
			warningNotification(t('Warning.invalid.auth.title'), t('Warning.invalid.auth.desc'));
			return false;
		}
		e.preventDefault();
		changeActiveMintOverlay(true);
	}

	function setActiveSellOverlay(e) {
		e.preventDefault();
		changeActiveSellOverlay(true);
	}

	function setActiveBuyOverlay(e) {
		e.preventDefault();
		changeActiveBuyOverlay(true);
	}

	function setActiveBuyOfferOverlay(e) {
		e.preventDefault();
		changeActiveBuyOfferOverlay(true);
	}

	//
	// Render elements
	//

	function renderTimer() {
		if (marketStatus === 1) {
			return (
				<>
					<h3 className="o-small-title">{t('Land.closes.label')}</h3>
					<TimeCounter date_end={auction ? auction.closeAt : 24}></TimeCounter>
				</>
			);
		} else {
			return <div>&nbsp;</div>;
		}
	}

	const handleEtherscan = (e) => {
		e.preventDefault();
		let etherscanLink = 'https://etherscan.io/token/0x56b80bbee68932a8d739315c79bc7b125341098a?a=' + integerId;
		window.open(etherscanLink, '_blank');
	};

	function renderVisitOnEtherscan() {
		let rend = <></>;
		if (mintTxHash !== undefined && mintTxHash !== '' && mintTxHash !== null) {
			// If land has been minted
			if (marketStatus == 2) {
				rend = (
					<a to="" href="#" className="l-check-on-etherscan" onClick={handleEtherscan}>
						{t('ActivityTile.view.ether')}
					</a>
				);
			}
			// If land has been assigned but not minted
			if (marketStatus == 11) {
				rend = (
					<div className="l-light-minted-copy">
						{t('Land.has.been.assigned')}
						<br></br>
						<a
							to=""
							href="#"
							onClick={(e) => {
								e.preventDefault();
								window.open('https://www.ovr.ai/blog/introducing-light-minting/', '_blank');
							}}
						>
							{t('BuyTokens.read.more')}
						</a>
						.
					</div>
				);
			}
		}
		return rend;
	}

	function renderBadge() {
		let badge = <div>&nbsp;</div>;

		switch (marketStatus) {
			case 1:
				badge = (
					<div>
						<h3 className="o-small-title">{t('Land.status.label')}</h3>
						<div className="c-status-badge  --open">{t('Land.open.label')}</div>
					</div>
				);
				break;
			case 2:
				badge = (
					<div>
						<h3 className="o-small-title">{t('Land.status.label')}</h3>
						<div className="c-status-badge  --owned">{t('Land.owned.label')}</div>
					</div>
				);
				break;
			case 11:
				badge = (
					<div>
						<h3 className="o-small-title">{t('Land.status.label')}</h3>
						<div className="c-status-badge  --owned">{t('Land.owned.label')}</div>
					</div>
				);
				break;
			default:
				badge = <div>&nbsp;</div>;
		}

		switch (userPerspective) {
			case 1:
				badge = (
					<div>
						<h3 className="o-small-title">{t('Land.status.label')}</h3>
						<div className="c-status-badge --bestbid">{t('Land.owner.label')}</div>
					</div>
				);
				break;
			case 2:
				badge = (
					<div>
						<h3 className="o-small-title">{t('Land.status.label')}</h3>
						<div className="c-status-badge  --bestbid">{t('Land.best.bid')}</div>
					</div>
				);
				break;
			case 3:
				badge = (
					<div>
						<h3 className="o-small-title">{t('Land.status.label')}</h3>
						<div className="c-status-badge  --outbidded">{t('Land.outbidded.label')}</div>
					</div>
				);
				break;
			default:
				break;
		}

		if (isUnavailable == true) {
			badge = (
				<div>
					<h3 className="o-small-title">{t('Land.status.label')}</h3>
					<div className="c-status-badge  --outbidded">{t('Land.unvabilable')}</div>
				</div>
			);
		}

		if (marketStatus == 10) {
			badge = (
				<div>
					<h3 className="o-small-title">{t('Land.status.label')}</h3>
					<div className="c-status-badge  --open">
						{t('Land.closing')} <CircularProgress />
					</div>
				</div>
			);
		}

		return badge;
	}

	function renderOverlayButton() {
		let button = <div>&nbsp;</div>;
		switch (marketStatus) {
			case 0:
				if (isUnavailable == false) {
					button = (
						<HexButton
							url="/"
							text={t('Land.init.auction')}
							className="--blue"
							onClick={(e) => setActiveMintOverlay(e)}
						></HexButton>
					);
				} else {
					button = (
						<HexButton
							url={`mailto:info@ovr.ai?subject=Interested in ${hexId}`}
							target="_blank"
							text={t('Generic.contactus.interested')}
							className="--blue"
						></HexButton>
					);
				}
				break;
			case 1:
				button = (
					<HexButton
						url="/"
						text={t('Land.place.bid')}
						className="--purple"
						onClick={(e) => setActiveBidOverlay(e)}
					></HexButton>
				);
				break;
			case 10:
				button = <div></div>;
				break;
			case 11:
				// If land has been assigned, check if you are owner
				if (userPerspective == 1) {
					button = (
						<HexButton
							url="/"
							text={t('Land.redeem.land')}
							className="--purple"
							onClick={(e) => redeemLand(e)}
						></HexButton>
					);
				}

				break;
			// case 2:
			// 	button = <></>;
			// 	if (userPerspective == 0) {
			// 		button = (
			// 			<HexButton
			// 				url="/"
			// 				text={t('Land.buy.offer')}
			// 				className="--blue"
			// 				onClick={(e) => setActiveBuyOfferOverlay(e)}
			// 			></HexButton>
			// 		);
			// 	} else if (userPerspective == 1) {
			// 		button = (
			// 			<HexButton url="/" text={t('Land.sell.land')} className="--purple --disabled" onClick={(e) => setActiveSellOverlay(e)}></HexButton>
			// 		);
			// 	}

			// 	break;
			// case 3:
			// 	button = (
			// 		<HexButton url="/" text={t('Land.sell.land')} className="--purple" onClick={(e) => setActiveSellOverlay(e)}></HexButton>
			// 	);
			// 	break;
			// case 4:
			// 	button = (
			// 		<HexButton url="/" text={t('Land.buy.now')} className="--purple" onClick={(e) => setActiveBuyOverlay(e)}></HexButton>
			// 	);
			// 	break;
			default:
				button = <div>&nbsp;</div>;
				break;
		}

		return button;
	}

	// Sets the price displayed below the map
	const setContractPrice = async (hex_id) => {
		const landId = parseInt(hex_id, 16);
		const land = await ico.landsAsync(landId);
		let currentBid = String(window.web3.fromWei(land[2]));
		if (currentBid == 0) {
			currentBid = String(window.web3.fromWei(await ico.initialLandBidAsync()));
		}
		setValue(currentBid);
	};

	function renderPrice() {
		switch (marketStatus) {
			case 2:
				return (
					<>
						{isLoggedIn ? (
							<>
								<h3 className="o-small-title">{t('Land.closing.price')}</h3>
								<ValueCounter value={value}></ValueCounter>
							</>
						) : (
							<></>
						)}
					</>
				);
			default:
				return (
					<>
						{isLoggedIn ? (
							<>
								<h3 className="o-small-title">{t('Land.price.label')}</h3>
								<ValueCounter value={value}></ValueCounter>
							</>
						) : (
							<></>
						)}
					</>
				);
		}
	}

	function renderBidHistory() {
		if (auction === null || auction.bidHistory.length === 0) {
			return (
				<div className="o-container">
					<div className="Title__container">
						<h3 className="o-small-title"></h3>
					</div>
					<div className="c-dialog --centered">
						{!isUnavailable ? (
							<>
								<div className="c-dialog-main-title">
									{t('Land.be.the.one')}{' '}
									<span role="img" aria-label="fire-emoji">
										🔥
									</span>
								</div>
								<div className="c-dialog-sub-title">
									<Trans i18nKey="Land.no.active.auction">
										The land has no active Auction at the moment. <br></br>Click on "Init Auction" and be the one to own
										it.
									</Trans>
								</div>
							</>
						) : (
							<>
								<div className="c-dialog-main-title"></div>
								<div className="c-dialog-sub-title">{t('Lands.not.available.liquidity.mining')} </div>
							</>
						)}
					</div>
				</div>
			);
		} else {
			return (
				<div className="o-container">
					<div className="Title__container">
						<h3 className="o-small-title">{t('Land.bid.history')}</h3>
					</div>
					<div className="Table__container">
						<table className="Table">
							<thead>
								<tr>
									<th>{t('Land.price.label')}</th>
									<th>{t('Land.when.label')}</th>
									<th>{t('Land.from.label')}</th>
								</tr>
							</thead>
							<tbody>
								{auction.bidHistory.map((bid) => (
									<tr key={bid.when} className="Table__line">
										<td>
											<ValueCounter value={bid.worth}></ValueCounter>{' '}
										</td>
										<td>
											<TimeCounter date_end={bid.when}></TimeCounter>
										</td>
										<td>{bid.from}</td>
										{bid.status === '-99' ? (
											<td>
												<div className="c-status-badge  --outbidded">FAILED</div>
											</td>
										) : (
											<></>
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			);
		}
	}

	function renderActiveOpenOrders() {
		let custom_return = <></>;
		let renderOpenSell = <></>;
		let renerOpenBuyOffers = <></>;
		const displayBuyOffers = marketStatus === 2;
		const displaySells = marketStatus === 3;

		// If there are Buy Offers
		if (openBuyOffers.length > 0) {
			// If the land is owned, is not yours and is not on sale show the buy offer option
			if (displayBuyOffers) {
				renerOpenBuyOffers = openBuyOffers.map((offer) => (
					<BuyOfferOrder
						key={offer.id}
						offer={offer}
						isOwner={true}
						userPerspective={userPerspective}
						userProvider={this.props.userProvider}
						web3Provide={this.props.web3Provider}
					></BuyOfferOrder>
				));
				// Else show the offers for the seller to accept or decline them
			} else if (displaySells) {
				renderOpenSell = openBuyOffers.map((offer) => (
					<BuyOfferOrder
						key={offer.id}
						offer={offer}
						isOwner={false}
						userPerspective={userPerspective}
						userProvider={this.props.userProvider}
						web3Provide={this.props.web3Provider}
					></BuyOfferOrder>
				));
			}
		}

		if (displaySells || displayBuyOffers) {
			custom_return = (
				<div className="Land__section">
					<div className="o-container">
						<div className="Title__container">
							{' '}
							<h3 className="o-small-title">Open Orders</h3>
						</div>
						<div className="Body__container">
							{renderOpenSell}
							{renerOpenBuyOffers}
						</div>
					</div>
				</div>
			);
		}

		return custom_return;
	}

	function renderLand() {
		let custom_return;
		if (isNotValidH3 == false) {
			custom_return = (
				<div className="Land">
					<BidOverlay
						currentBid={value}
						land={{ hexId: hexId, marketStatus: marketStatus, name: name, location: location }}
						auction={auction}
					></BidOverlay>
					<MintOverlay
						currentBid={value}
						land={{ hexId: hexId, marketStatus: marketStatus, name: name, location: location }}
					></MintOverlay>
					<SellOverlay
						currentBid={value}
						land={{ hexId: hexId, marketStatus: marketStatus, name: name, location: location }}
					></SellOverlay>
					<BuyOfferOverlay
						currentBid={value}
						land={{ hexId: hexId, marketStatus: marketStatus, name: name, location: location }}
					></BuyOfferOverlay>
					<BuyLandOverlay
						currentBid={value}
						land={{ hexId: hexId, marketStatus: marketStatus, name: name, location: location }}
					></BuyLandOverlay>

					<div className="o-container">
						<div className="Land__heading__1">
							<h2>
								<span className="--nft-id">NFT ID: {integerId}</span>
								<Textfit mode="single" max={25}>
									{name.sentence}
								</Textfit>
							</h2>
							<div className="Land__location">{location}</div>
						</div>
						<div className="Land__heading__2">
							<div className="o-fourth">{renderPrice()}</div>
							<div className="o-fourth">{renderTimer()}</div>
							<div className="o-fourth">{renderBadge()}</div>
							<div className="o-fourth">
								{renderVisitOnEtherscan()}
								{renderOverlayButton()}
							</div>
						</div>
					</div>
					{/* {renderActiveOpenOrders()} */}
					<div className="Land__section">{renderBidHistory()}</div>
				</div>
			);
		} else {
			custom_return = (
				<div className="Land">
					<div className="o-container">
						<div className="c-dialog --centered --not-found">
							<h1>404</h1>
							<div className="c-dialog-main-title">Land not found</div>
							<div className="c-dialog-sub-title">
								The requested land name was not found. <br></br>Click anywhere in the map or go to "Marketplace" and
								start from there.
							</div>
						</div>
					</div>
				</div>
			);
		}
		return custom_return;
	}

	return renderLand();
};

Land.propTypes = {
	match: PropTypes.object,
	reloadLandStatefromApi: PropTypes.func,
	userProvider: PropTypes.object,
	mapProvider: PropTypes.object,
	web3Provider: PropTypes.object,
	land: PropTypes.object,
	className: PropTypes.string,
	url: PropTypes.string,
};

export default withWeb3Context(withUserContext(withMapContext(Land)));
