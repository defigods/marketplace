import React, { Component } from 'react';
import ValueCounter from '../ValueCounter/ValueCounter';
import TimeCounter from '../TimeCounter/TimeCounter';
import HexButton from '../HexButton/HexButton';
import Modal from '@material-ui/core/Modal';
import { withMapContext } from '../../context/MapContext';
import { withUserContext } from '../../context/UserContext';
import { deleteBuyOffer, hitBuyOffer } from '../../lib/api';
import { networkError, dangerNotification, successNotification, warningNotification } from '../../lib/notifications';

export class BuyOfferOrder extends Component {
	constructor(props) {
		super(props);
		const pathHexId = window.location.pathname.split('/')[3];
		this.state = {
			openModal: false,
			offerId: this.props.offer.id,
			hexId: pathHexId && pathHexId.length === 15 ? pathHexId : this.props.mapProvider.state.hex_id,
		};

		this.confirmDeleteBuyOffer = this.confirmDeleteBuyOffer.bind(this);
		this.confirmSell = this.confirmSell.bind(this);
		this.handleOpen = this.handleOpen.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.buttonRender = this.buttonRender.bind(this);
		this.cancelBuyOffer = this.props.userProvider.actions.cancelBuyOffer;
		this.setupComplete = this.props.userProvider.state.setupComplete;
	}

	setupListeners() {
		document.addEventListener('land-selected', (event) => {
			this.setState({ hexId: event.detail.hex_id });
		});
	}

	async confirmDeleteBuyOffer(offerId) {
		await this.cancelBuyOffer(offerId);
		this.handleClose();
	}

	confirmSell() {
		// TODO When the user confirms to accept this buy offer
	}

	handleOpen() {
		if (this.props.userProvider.state.isLoggedIn) {
			this.setState({ openModal: true });
		} else {
			warningNotification('Invalid authentication', 'Please Log In to buy land');
		}
	}

	handleClose() {
		this.setState({ openModal: false });
	}

	componentDidMount() {
		if (this.setupComplete) this.setupListeners();
	}

	buttonRender() {
		let customRender;
		if (!this.props.isOwner) {
			customRender = (
				<>
					<div className="section">
						<button type="button" className="orderTileButton" onClick={this.handleOpen}>
							Sell
						</button>
					</div>
					<div className="section"></div>
					<Modal
						aria-labelledby="simple-modal-title"
						aria-describedby="simple-modal-description"
						open={this.state.openModal}
						onClose={this.handleClose}
					>
						<div className="BuyOfferModal">
							<h2>Sell confirmation</h2>
							<p>
								Do you confirm the sell of this <b>OVRLand</b>?
							</p>
							<div className="Overlay__bid_container">
								<div className="OrderModal__bid">
									<div className="Overlay__bid_title">Sell at</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={this.props.offer.price}></ValueCounter>
									</div>
								</div>
							</div>
							<div className="Modal__buttons_container">
								<HexButton url="#" text="Confirm" className={'--purple'} onClick={() => this.confirmSell(this.props.offer.id)}></HexButton>
								<HexButton url="#" text="Cancel" className="--outline" onClick={this.handleClose}></HexButton>
							</div>
						</div>
					</Modal>
				</>
			);
		} else {
			customRender = (
				<>
					<div className="section">
						<button type="button" className="orderTileButton" onClick={this.handleOpen}>
							Delete
						</button>
					</div>
					<div className="section"></div>
					<Modal
						aria-labelledby="simple-modal-title"
						aria-describedby="simple-modal-description"
						open={this.state.openModal}
						onClose={this.handleClose}
					>
						<div className="BuyOfferModal">
							<h2>Delete confirmation</h2>
							<p>
								Do you confirm the delete of this <b>Buy offer</b>?
							</p>
							<div className="Modal__buttons_container">
								<HexButton
									url="#"
									text="Confirm"
									className={'--purple'}
									onClick={() => this.confirmDeleteBuyOffer(this.props.offer.id)}
								></HexButton>
								<HexButton url="#" text="Cancel" className="--outline" onClick={this.handleClose}></HexButton>
							</div>
						</div>
					</Modal>
				</>
			);
		}
		return customRender;
	}

	render() {
		return (
			<div className="BuyOfferTile">
				<div className="section">
					<ValueCounter value={this.props.offer.price}></ValueCounter>
				</div>
				<div className="section">
					<b>Buy Offer Order</b>
				</div>
				<div className="section">
					<span className="c-small-tile-text">Expires</span>{' '}
					<TimeCounter date_end={new Date(this.props.offer.expirationDate * 1000)}></TimeCounter>
				</div>
				{this.buttonRender()}
			</div>
		);
	}
}

export default withUserContext(withMapContext(BuyOfferOrder));
