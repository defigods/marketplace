import React, { Component } from 'react';
import ValueCounter from '../ValueCounter/ValueCounter';
import TimeCounter from '../TimeCounter/TimeCounter';
import HexButton from '../HexButton/HexButton';
import Modal from '@material-ui/core/Modal';

import { deleteBuyOffer, hitBuyOffer } from '../../lib/api';

import { networkError, dangerNotification, successNotification, warningNotification } from '../../lib/notifications';

export class BuyOfferOrder extends Component {
	constructor(props) {
		super(props);
		console.log('BuyOfferOrderValues', props);
		this.state = {
			openModal: false,
		};

		this.confirmDeleteBuyOffer = this.confirmDeleteBuyOffer.bind(this);
		this.confirmSell = this.confirmSell.bind(this);
		this.handleOpen = this.handleOpen.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.buttonRender = this.buttonRender.bind(this);
	}

	confirmDeleteBuyOffer() {
		deleteBuyOffer(this.props.order.orderUuid) // Call API function
			.then((response) => {
				if (response.data.result === true) {
					successNotification('Action complete', 'Delete of buy offer complete');
					this.handleClose();
				} else {
					dangerNotification('Unable to delete buy offer', response.data.errors[0].message);
				}
			})
			.catch(() => {
				// Notify user if network error
				networkError();
			});
	}

	confirmSell() {
		hitBuyOffer(this.props.order.orderUuid) // Call API function
			.then((response) => {
				if (response.data.result === true) {
					successNotification('Action complete', 'You sold the land');
					this.handleClose();
				} else {
					dangerNotification('Unable to buy land', response.data.errors[0].message);
				}
			})
			.catch(() => {
				// Notify user if network error
				networkError();
			});
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

	componentDidMount() {}

	buttonRender() {
		let customRender;
		if (this.props.userPerspective === 1) {
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
										<ValueCounter value={this.props.order.worth}></ValueCounter>
									</div>
								</div>
							</div>
							<div className="Modal__buttons_container">
								<HexButton url="#" text="Confirm" className={'--purple'} onClick={this.confirmSell}></HexButton>
								<HexButton url="#" text="Cancel" className="--outline" onClick={this.handleClose}></HexButton>
							</div>
						</div>
					</Modal>
				</>
			);
		} else if (this.props.userProvider.state.user.uuid === this.props.order.userUuid) {
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
									onClick={this.confirmDeleteBuyOffer}
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
		if (this.props.userProvider.state.user.uuid === this.props.order.userUuid || this.props.userPerspective === 1) {
			return (
				<div className="BuyOfferTile">
					<div className="section">
						<ValueCounter value={this.props.order.worth}></ValueCounter>
					</div>
					<div className="section">
						<b>Buy Offer Order</b>
					</div>
					<div className="section">
						<span className="c-small-tile-text">Expires</span>{' '}
						<TimeCounter date_end={this.props.order.expirationDate}></TimeCounter>
					</div>
					{this.buttonRender()}
				</div>
			);
		} else {
			return <></>;
		}
	}
}

export default BuyOfferOrder;
