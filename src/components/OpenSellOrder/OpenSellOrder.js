import React, { Component } from 'react';
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import TimeCounter from '../../components/TimeCounter/TimeCounter';
import HexButton from '../../components/HexButton/HexButton';
import Modal from '@material-ui/core/Modal';

import { Trans, useTranslation } from 'react-i18next'

import { deleteSellLand, buyLand } from '../../lib/api';
import { networkError, dangerNotification, successNotification, warningNotification } from '../../lib/notifications';

export class OpenSellOrder extends Component {

	constructor(props) {
		super(props);
		this.state = {
			openModal: false,
		};
	}

	confirmDeleteSell = () => {
		const { t, i18n } = useTranslation()
		deleteSellLand(this.props.order.landUuid) // Call API function
			.then((response) => {
				if (response.data.result === true) {
					successNotification(t('Success.action.title'), t('Success.delete.order.desc'));
					// this.props.reloadLandStatefromApi(this.props.order.landUuid)
					this.handleClose();
				} else {
					dangerNotification(t('Danger.unable.delete.sell.title'), response.data.errors[0].message);
				}
			})
			.catch(() => {
				// Notify user if network error
				networkError();
			});
	};

	confirmBuy = () => {
		const { t, i18n } = useTranslation()
		buyLand(this.props.order.landUuid) // Call API function
			.then((response) => {
				if (response.data.result === true) {
					successNotification(t('Success.action.title'), t('Success.land.own.desc'));
					// this.props.reloadLandStatefromApi(this.props.order.landUuid)
					this.handleClose();
				} else {
					dangerNotification(t('Danger.unable.buy.land.title'), response.data.errors[0].message);
				}
			})
			.catch(() => {
				// Notify user if network error
				networkError();
			});
	};

	handleOpen = () => {
		const { t, i18n } = useTranslation()
		if (this.props.userProvider.state.isLoggedIn) {
			this.setState({ openModal: true });
		} else {
			warningNotification(t('Warning.invalid.auth.title'), t('Warning.invalid.auth.desc.buy'));
		}
	};

	handleClose = () => {
		this.setState({ openModal: false });
	};

	componentDidMount() {}

	buttonRender = () => {
		const { t, i18n } = useTranslation()
		let customRender;
		if (this.props.userPerspective === 1) {
			customRender = (
				<>
					<div className="section">
						<button type="button" className="orderTileButton" onClick={this.handleOpen}>
							{t('Generic.delete.label')}
						</button>
					</div>
					<div className="section"></div>
					<Modal
						aria-labelledby="simple-modal-title"
						aria-describedby="simple-modal-description"
						open={this.state.openModal}
						onClose={this.handleClose}
					>
						<div className="SellOrderModal">
							<h2>{t('OpenSellOrder.delete.confirm')}</h2>
							<p>
								<Trans i18nKey="OpenSellOrder.delete.ask">
									Do you confirm the delete of this <b>Open Sell Order</b>?
								</Trans>
							</p>
							<div className="Modal__buttons_container">
								<HexButton url="#" text={t('OpenSellOrder.confirm.label')} className={`--purple`} onClick={this.confirmDeleteSell}></HexButton>
								<HexButton url="#" text={t('Generic.cancel.label')} className="--outline" onClick={this.handleClose}></HexButton>
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
							{t('OpenSellOrder.buy.now')}
						</button>
					</div>
					<div className="section"></div>
					<Modal
						aria-labelledby="simple-modal-title"
						aria-describedby="simple-modal-description"
						open={this.state.openModal}
						onClose={this.handleClose}
					>
						<div className="SellOrderModal">
							<h2>{t('OpenSellOrder.buy.confirm')}</h2>
							<p>
								<Trans i18nKey="OpenSellOrder.buy.ask">
									Do you confirm the buy of this <b>OVRLand</b>?
								</Trans>
							</p>
							<div className="Overlay__bid_container">
								<div className="OrderModal__bid">
									<div className="Overlay__bid_title">{t('OpenSellOrder.buy.for')}</div>
									<div className="Overlay__bid_cont">
										<ValueCounter value={this.props.order.worth}></ValueCounter>
									</div>
								</div>
							</div>
							<div className="Modal__buttons_container">
								<HexButton url="#" text={t('OpenSellOrder.confirm.label')} className={`--purple`} onClick={this.confirmBuy}></HexButton>
								<HexButton url="#" text={t('Generic.cancel.label')} className="--outline" onClick={this.handleClose}></HexButton>
							</div>
						</div>
					</Modal>
				</>
			);
		}
		return customRender;
	};

	render() {
		const { t, i18n } = useTranslation()
		return (
			<div className="SellOrderTile">
				<div className="section">
					<ValueCounter value={this.props.order.worth}></ValueCounter>
				</div>
				<div className="section">
					<b>{t('OpenSellOrder.open.order')}</b>
				</div>
				<div className="section">
					<span className="c-small-tile-text">{t('OpenSellOrder.placed.label')}</span>{' '}
					<TimeCounter date_end={this.props.order.createdAt}></TimeCounter>
				</div>
				{this.buttonRender()}
			</div>
		);
	}
}

export default OpenSellOrder;
