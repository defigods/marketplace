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

import { getLand } from '../../lib/api';
import { networkError } from '../../lib/notifications';

import { Textfit } from 'react-textfit';

export class Land extends Component {
	constructor(props) {
		super(props);
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
		};
		this.mapActions = this.props.mapProvider.actions;
	}

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
					marketStatus: data.marketStatus,
					userPerspective: data.userPerspective,
					openSellOrder: data.openSellOrder,
					openBuyOffers: data.openBuyOffers,
					auction: data.auction,
					value: data.value,
				};
				this.mapActions.changeLandData(state);
				this.setState(state);

				this.updateMarketStatusFromSmartContract(hex_id)
			})
			.catch((error) => {
				// Notify user if network error
				console.log(error);
				networkError();
			});
	}

	componentDidMount() {
		const hex_id = this.props.match.params.id;
		// Focus map on hex_id
		this.mapActions.changeHexId(hex_id);
		// Load data from API
		this.loadLandStateFromApi(hex_id);
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

	updateMarketStatusFromSmartContract(hex_id) {
		// TODO working on this
		// Set 0 for not started, 1 for started and 2 for ended
		// const landId = parseInt(hex_id, 16)
		// const ico = this.props.userProvider.state.ico
		// ico.getLand
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
					<TimeCounter date_end={this.state.auction.closeAt}></TimeCounter>
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
					<HexButton url="/" text="Init Auction" className="--blue" onClick={(e) => this.setActiveMintOverlay(e)}></HexButton>
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
			default:
				button = <div>&nbsp;</div>;
				break;
		}

		switch (this.state.userPerspective) {
			case 1:
				button = (
					<HexButton
						url="/"
						text="Sell Land"
						className="--purple"
						onClick={(e) => this.setActiveSellOverlay(e)}
					></HexButton>
				);
				break;
			default:
				break;
		}
		return button;
	}

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
		let displayBuyOffers = false;

		// If there are open Sell Orders
		if (this.state.openSellOrder != null) {
			openSell = (
				<OpenSellOrder
					order={this.state.openSellOrder}
					userPerspective={this.state.userPerspective}
					userProvider={this.props.userProvider}
				></OpenSellOrder>
			);
		}

		// If there are Buy Offers
		if (this.state.openBuyOffers.length > 0) {
			displayBuyOffers =
				this.state.userPerspective === 1 ||
				(this.state.openBuyOffers != null &&
					this.state.openBuyOffers.map((a) => a.userUuid).includes(this.props.userProvider.state.user.uuid));

			if (displayBuyOffers) {
				openBuyOffers = this.state.openBuyOffers.map((obj) => (
					<BuyOfferOrder
						order={obj}
						userPerspective={this.state.userPerspective}
						userProvider={this.props.userProvider}
					></BuyOfferOrder>
				));
			}
		}

		if (this.state.openSellOrder || (displayBuyOffers && this.state.openBuyOffers.length > 0)) {
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
