import React, { Component } from 'react';
import { withMapContext } from '../../context/MapContext';
import { withUserContext } from '../../context/UserContext';
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import TimeCounter from '../../components/TimeCounter/TimeCounter';
import HexButton from '../../components/HexButton/HexButton';
import BidOverlay from '../../components/BidOverlay/BidOverlay';
import MintOverlay from '../../components/MintOverlay/MintOverlay';
import SellOverlay from '../../components/SellOverlay/SellOverlay';
import BuyOfferOverlay from '../../components/BuyOfferOverlay/BuyOfferOverlay';
import OpenSellOrder from '../../components/OpenSellOrder/OpenSellOrder';
import BuyOfferOrder from '../../components/BuyOfferOrder/BuyOfferOrder';
import BuyLandOverlay from '../../components/BuyLandOverlay/BuyLandOverlay';

import { getLand } from '../../lib/api';
import { networkError } from '../../lib/notifications';

import { Textfit } from 'react-textfit';
import { ca } from 'date-fns/esm/locale';

export class Land extends Component {
	constructor(props) {
		super(props);
		const pathHexId = window.location.pathname.split('/')[3];
		this.state = {
			key: '8cbcc350c0ab5ff',
			value: 10,
			name: { sentence: 'director.connect.overflow', hex: '8cbcc350c0ab5ff' },
			location: 'Venice, Italy',
			marketStatus: 0,
			userPerspective: 0,
			auction: null,
			openSellOrder: null,
			openBuyOffers: [],
			hexId: pathHexId && pathHexId.length === 15 ? pathHexId : this.props.mapProvider.state.hex_id,
		};
		this.mapActions = this.props.mapProvider.actions;
	}

	componentDidMount() {
		const hex_id = this.props.match.params.id;
		// Focus map on hex_id
		this.mapActions.changeHexId(hex_id);
		// Load data from API
		this.loadLandStateFromApi(hex_id);
		if (this.props.userProvider.state.setupComplete && this.props.userProvider.state.ico) this.setupListeners();
		let setupInterval = setInterval(() => {
			if (this.props.userProvider.state.setupComplete && this.props.userProvider.state.ico) {
				this.setupListeners();
				clearInterval(setupInterval);
			}
		}, 5e2);
	}

	setupListeners() {
		this.getBuyOffers();
		this.setContractPrice(this.state.hexId);
		// Update offers every half a second
		setInterval(() => {
			this.getBuyOffers();
			this.updateMarketStatusFromSmartContract(this.state.hexId);
			this.setContractPrice(this.state.hexId);
		}, 5e2);
		document.addEventListener('land-selected', (event) => {
			this.setState({ hexId: event.detail.hex_id });
			this.setContractPrice(event.detail.hex_id);
			this.getBuyOffers();
		});
	};

	loadLandStateFromApi(hex_id) {
		// Call API function
		getLand(hex_id)
			.then((response) => {
				let data = response.data;
				console.log('landApiData', data);
				const state = {
					key: data.uuid,
					name: { sentence: data.sentenceId, hex: data.uuid },
					location: data.address.full,
					// marketStatus: data.marketStatus,
					userPerspective: data.userPerspective,
					openSellOrder: data.openSellOrder,
					// openBuyOffers: data.openBuyOffers,
					auction: data.auction,
					// value: data.value,
				};
				this.mapActions.changeLandData(state);
				this.setState(state);

				if (this.props.userProvider.state.ico) {
					this.updateMarketStatusFromSmartContract(hex_id);
				} else {
					const myInterval = setInterval(() => {
						if (this.props.userProvider.state.ico) {
							this.updateMarketStatusFromSmartContract(hex_id);
							clearInterval(myInterval);
						}
					}, 2e3);
				}
			})
			.catch((error) => {
				// Notify user if network error
				console.log(error);
				networkError();
			});
	}

	componentDidUpdate(prevProps) {
		// If param change load data from API
		if (this.props.location !== prevProps.location || this.props.value !== prevProps.value) {
			const hex_id = this.props.match.params.id;
			this.loadLandStateFromApi(hex_id);
			this.mapActions.changeHexId(hex_id);
		}
	}

	componentWillUnmount() {
		this.mapActions.changeActiveBidOverlay(false);
		this.mapActions.changeActiveMintOverlay(false);
		this.mapActions.changeActiveSellOverlay(false);
	}

	async updateMarketStatusFromSmartContract(hex_id) {
		// Set 0 for not started, 1 for started and 2 for ended
		const ico = this.props.userProvider.state.ico;
		const landId = parseInt(hex_id, 16);
		const land = await ico.landsAsync(landId);
		const lastPaymentTimestamp = land[3];
		const landOwner = land[0];
		const auctionLandDuration = await ico.auctionLandDurationAsync();
		// Check is the land is ended by comparing the timestamp to 24 hours
		const now = Math.trunc(Date.now() / 1000);
		const landContractState = parseInt(land[4]);
		const isOnSale = land[8];

		// Checks if the land is on sale also to display the right buy button
		if (isOnSale) {
			return this.setState({
				marketStatus: 4,
			});
		}

		// If 24 hours have passed, consider it sold
		// Checks if you're the owner or not to display the appropriate button
		if (landContractState === 2 || (landContractState === 1 && now > lastPaymentTimestamp + auctionLandDuration)) {
			if (landOwner === window.web3.eth.defaultAccount) {
				return this.setState({
					marketStatus: 3,
				});
			} else {
				return this.setState({
					marketStatus: 2,
				});
			}
		} else {
			this.setState({
				marketStatus: landContractState,
			});
		}
	}

	async getBuyOffers() {
		let offers = await this.props.userProvider.actions.getOffersToBuyLand(this.state.hexId);
		this.setState({
			openBuyOffers: offers,
		});
	}

	setActiveBidOverlay(e) {
		e.preventDefault();
		if (!this.props.userProvider.state.isLoggedIn) {
			// TODO remove comment
			// warningNotification("Invalid authentication", "Please Log In to partecipate")
			// this.props.history.push("/login")
		} else {
			// this.mapActions.changeActiveBidOverlay(true)
		}
		this.mapActions.changeActiveBidOverlay(true); // TODO COMMENT
	}

	setActiveMintOverlay(e) {
		e.preventDefault();
		this.mapActions.changeActiveMintOverlay(true);
	}

	setActiveSellOverlay(e) {
		e.preventDefault();
		this.mapActions.changeActiveSellOverlay(true);
	}

	setActiveBuyOverlay(e) {
		e.preventDefault();
		this.mapActions.changeActiveBuyOverlay(true);
	}

	setActiveBuyOfferOverlay(e) {
		e.preventDefault();
		this.mapActions.changeActiveBuyOfferOverlay(true);
	}

	realodLandStatefromApi = (value) => {
		// TODO Change with socket
		let that = this;
		setTimeout(function () {
			that.loadLandStateFromApi(value);
		}, 1500);
	};

	//
	// Render elements
	//

	renderTimer() {
		if (this.state.marketStatus === 1) {
			return (
				<>
					<h3 className="o-small-title">Closes</h3>
					<TimeCounter date_end={this.state.auction ? this.state.auction.closeAt : 24}></TimeCounter>
				</>
			);
		} else {
			return <div>&nbsp;</div>;
		}
	}

	renderBadge() {
		let badge = <div>&nbsp;</div>;
		switch (this.state.marketStatus) {
			case 1:
				badge = (
					<div>
						<h3 className="o-small-title">Status</h3>
						<div className="c-status-badge  --open">OPEN</div>
					</div>
				);
				break;
			case 2:
				badge = (
					<div>
						<h3 className="o-small-title">Status</h3>
						<div className="c-status-badge  --owned">OWNED</div>
					</div>
				);
				break;
			default:
				badge = <div>&nbsp;</div>;
		}

		switch (this.state.userPerspective) {
			case 1:
				badge = (
					<div>
						<h3 className="o-small-title">Status</h3>
						<div className="c-status-badge --bestbid">OWNER</div>
					</div>
				);
				break;
			case 2:
				badge = (
					<div>
						<h3 className="o-small-title">Status</h3>
						<div className="c-status-badge  --bestbid">BEST BID</div>
					</div>
				);
				break;
			case 3:
				badge = (
					<div>
						<h3 className="o-small-title">Status</h3>
						<div className="c-status-badge  --outbidded">OUTBIDDED</div>
					</div>
				);
				break;
			default:
				break;
		}

		return badge;
	}

	renderOverlayButton() {
		let button = <div>&nbsp;</div>;
		switch (this.state.marketStatus) {
			case 0:
				button = (
					<HexButton
						url="/"
						text="Init Auction"
						className="--blue"
						onClick={(e) => this.setActiveMintOverlay(e)}
					></HexButton>
				);
				break;
			case 1:
				button = (
					<HexButton
						url="/"
						text="Place bid"
						className="--purple"
						onClick={(e) => this.setActiveBidOverlay(e)}
					></HexButton>
				);
				break;
			case 2:
				button = (
					<HexButton
						url="/"
						text="Buy offer"
						className="--blue"
						onClick={(e) => this.setActiveBuyOfferOverlay(e)}
					></HexButton>
				);
				break;
			case 3:
				button = (
					<HexButton
						url="/"
						text="Sell Land"
						className="--purple"
						onClick={(e) => this.setActiveSellOverlay(e)}
					></HexButton>
				);
				break;
			case 4:
				button = (
					<HexButton
						url="/"
						text="Buy Now"
						className="--purple"
						onClick={(e) => this.setActiveBuyOverlay(e)}
					></HexButton>
				);
				break;
			default:
				button = <div>&nbsp;</div>;
				break;
		}

		return button;
	}

	// Sets the price displayed below the map
	setContractPrice = (hex_id) => {
		let ico = this.props.userProvider.state.ico;
		const icoLoadInterval = setInterval(async () => {
			ico = this.props.userProvider.state.ico;
			if (ico) {
				clearInterval(icoLoadInterval);
				const landId = parseInt(hex_id, 16);
				const land = await ico.landsAsync(landId);
				let currentBid = String(window.web3.fromWei(land[2]));
				if (currentBid == 0) {
					currentBid = String(window.web3.fromWei(await ico.initialLandBidAsync()));
				}

				this.setState({
					value: currentBid,
				});
			}
		}, 1e2);
	};

	renderPrice() {
		switch (this.state.marketStatus) {
			case 2:
				return (
					<>
						<h3 className="o-small-title">Closing price</h3>
						<ValueCounter value={this.state.value}></ValueCounter>
					</>
				);
			default:
				return (
					<>
						<h3 className="o-small-title">Price</h3>
						<ValueCounter value={this.state.value}></ValueCounter>
					</>
				);
		}
	}

	renderBidHistory() {
		if (this.state.auction === null || this.state.auction.bidHistory.length === 0) {
			return (
				<div className="o-container">
					<div className="Title__container">
						{' '}
						<h3 className="o-small-title">History</h3>
					</div>
					<div className="c-dialog --centered">
						<div className="c-dialog-main-title">
							Be the one to start an auction{' '}
							<span role="img" aria-label="fire-emoji">
								🔥
							</span>
						</div>
						<div className="c-dialog-sub-title">
							The land has no active Auction at the moment. <br></br>Click on "Init Auction" and be the one to own it.
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="o-container">
					<div className="Title__container">
						{' '}
						<h3 className="o-small-title">Bid History</h3>
					</div>
					<div className="Table__container">
						<table className="Table">
							<thead>
								<tr>
									<th>Price</th>
									<th>When</th>
									<th>From</th>
								</tr>
							</thead>
							<tbody>
								{this.state.auction.bidHistory.map((bid) => (
									<tr key={bid.when} className="Table__line">
										<td>
											<ValueCounter value={bid.worth}></ValueCounter>{' '}
										</td>
										<td>
											<TimeCounter date_end={bid.when}></TimeCounter>
										</td>
										<td>{bid.from}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			);
		}
	}

	renderActiveOpenOrders() {
		let custom_return = <></>;
		let openSell = <></>;
		let openBuyOffers = <></>;
		const  displayBuyOffers = this.state.marketStatus === 2;
		const displaySells = this.state.marketStatus === 3;


		// If there are Buy Offers
		if (this.state.openBuyOffers.length > 0) {
			// If the land is owned, is not yours and is not on sale show the buy offer option
			if (displayBuyOffers) {
				openBuyOffers = this.state.openBuyOffers.map((offer) => (
					<BuyOfferOrder
						key={offer.id}
						offer={offer}
						isOwner={true}
						userPerspective={this.state.userPerspective}
						userProvider={this.props.userProvider}
					></BuyOfferOrder>
				));
			// Else show the offers for the seller to accept or decline them
			} else if (displaySells) {
				openSell = this.state.openBuyOffers.map((offer) => (
					<BuyOfferOrder
						key={offer.id}
						offer={offer}
						isOwner={false}
						userPerspective={this.state.userPerspective}
						userProvider={this.props.userProvider}
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
							{openSell}
							{openBuyOffers}
						</div>
					</div>
				</div>
			);
		}

		return custom_return;
	}

	render() {
		return (
			<div className="Land">
				<BidOverlay
					currentBid={this.state.value}
					land={this.state}
					realodLandStatefromApi={this.realodLandStatefromApi}
				></BidOverlay>
				<MintOverlay
					currentBid={this.state.value}
					land={this.state}
					realodLandStatefromApi={this.realodLandStatefromApi}
				></MintOverlay>
				<SellOverlay
					currentBid={this.state.value}
					land={this.state}
					realodLandStatefromApi={this.realodLandStatefromApi}
				></SellOverlay>
				<BuyOfferOverlay
					currentBid={this.state.value}
					land={this.state}
					realodLandStatefromApi={this.realodLandStatefromApi}
				></BuyOfferOverlay>
				<BuyLandOverlay
					currentBid={this.state.value}
					land={this.state}
					realodLandStatefromApi={this.realodLandStatefromApi}
				></BuyLandOverlay>

				<div className="o-container">
					<div className="Land__heading__1">
						<h2>
							<Textfit mode="single" max={25}>
								{this.state.name.sentence}
							</Textfit>
						</h2>
						<div className="Land__location">{this.state.location}</div>
					</div>
					<div className="Land__heading__2">
						<div className="o-fourth">{this.renderPrice()}</div>
						<div className="o-fourth">{this.renderTimer()}</div>
						<div className="o-fourth">{this.renderBadge()}</div>
						<div className="o-fourth">{this.renderOverlayButton()}</div>
					</div>
				</div>
				{this.renderActiveOpenOrders()}
				<div className="Land__section">{this.renderBidHistory()}</div>
			</div>
		);
	}
}

export default withUserContext(withMapContext(Land));
