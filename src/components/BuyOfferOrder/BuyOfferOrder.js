import React, { Component } from 'react'
import ValueCounter from '../ValueCounter/ValueCounter'
import TimeCounter from '../TimeCounter/TimeCounter'
import HexButton from '../HexButton/HexButton'
import Modal from '@material-ui/core/Modal'
import { withMapContext } from '../../context/MapContext'
import { withUserContext } from '../../context/UserContext'
import { withWeb3Context } from '../../context/Web3Context'

import { deleteBuyOffer, hitBuyOffer } from '../../lib/api'
import {
  networkError,
  dangerNotification,
  successNotification,
  warningNotification,
} from '../../lib/notifications'
import './style.scss'
import { Trans, useTranslation } from 'react-i18next'

export class BuyOfferOrder extends Component {
  constructor(props) {
    super(props)
    const pathHexId = window.location.pathname.split('/')[3]
    this.state = {
      openModal: false,
      offerId: this.props.offer.id,
      openDeclineBuyModal: false,
      metamaskMessage: '',
      transactionInProcess: false,
      hexId:
        pathHexId && pathHexId.length === 15
          ? pathHexId
          : this.props.mapProvider.state.hex_id,
    }

    this.confirmDeleteBuyOffer = this.confirmDeleteBuyOffer.bind(this)
    this.confirmSell = this.confirmSell.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.buttonRender = this.buttonRender.bind(this)
    this.setupComplete = this.props.web3Provider.state.setupComplete
  }

  setupListeners() {
    document.addEventListener('land-selected', (event) => {
      this.setState({ hexId: event.detail.hex_id })
    })
  }

  // To delete/cancel a buy offer if you created it
  confirmDeleteBuyOffer = async (offerId) => {
    try {
      const tx = await this.props.web3Provider.actions.cancelBuyOffer(offerId)
      this.setState({
        metamaskMessage: this.props.t('MetamaskMessage.cancel.buy'),
        transactionInProcess: true,
      })
      await this.props.web3Provider.actions.waitTx(tx)
    } catch (e) {
      return dangerNotification(
        this.props.t('Danger.cancel.buy.title'),
        e.message
      )
    }
    successNotification(
      this.props.t('Success.delete.title'),
      this.props.t('Success.request.process.desc')
    )
    this.handleClose()
  }

  // To decline a buy offer
  declineBuyOffer = async (offerId) => {
    try {
      const tx = await this.props.web3Provider.actions.declineBuyOffer(offerId)
      this.setState({
        metamaskMessage: this.props.t('MetamaskMessage.decline.buy'),
        transactionInProcess: true,
      })
      await this.props.web3Provider.actions.waitTx(tx)
    } catch (e) {
      return dangerNotification(
        this.props.t('Danger.decline.buy.title'),
        e.message
      )
    }
    successNotification(
      this.props.t('Success.decline.title'),
      this.props.t('Success.request.process.desc')
    )
    this.handleClose()
  }

  // To accept a buy offer and sell your land
  confirmSell = async (offerId, landId) => {
    try {
      this.setState({
        metamaskMessage: this.props.t('MetamaskMessage.approve.ovr'),
        transactionInProcess: true,
      })
      await this.props.web3Provider.actions.approveErc721Token(landId, true)

      this.setState({
        metamaskMessage: this.props.t('MetamaskMessage.accept.sell'),
      })
      const newTx = await this.props.web3Provider.actions.acceptBuyOffer(
        offerId,
        landId
      )
      await this.props.web3Provider.actions.waitTx(newTx)
    } catch (e) {
      return dangerNotification(
        this.props.t('Danger.accept.buy.title'),
        e.message
      )
    }
    successNotification(
      this.props.t('Success.land.sold.title'),
      this.props.t('Success.request.process.desc')
    )
    this.handleClose()
  }

  handleOpen() {
    if (this.props.userProvider.state.isLoggedIn) {
      this.setState({ openModal: true })
    } else {
      warningNotification(
        this.props.t('Warning.invalid.auth.title'),
        this.props.t('Warning.invalid.auth.desc.buy')
      )
    }
  }

  openDeclineModal = () => {
    if (this.props.userProvider.state.isLoggedIn) {
      this.setState({ openDeclineBuyModal: true })
    } else {
      warningNotification(
        this.props.t('Warning.invalid.auth.title'),
        this.props.t('Warning.invalid.auth.desc.buy')
      )
    }
  }

  handleClose() {
    this.setState({
      openModal: false,
      openDeclineBuyModal: false,
      metamaskMessage: '',
      transactionInProcess: false,
    })
  }

  componentDidMount() {
    if (this.setupComplete) this.setupListeners()
  }

  buttonRender() {
    let customRender
    if (!this.props.isOwner) {
      customRender = (
        <>
          <div className="section">
            <button
              type="button"
              className="orderTileButton"
              onClick={this.handleOpen}
            >
              {this.props.t('BuyOfferOrder.accept.offer')}
            </button>{' '}
            <button
              type="button"
              className="orderTileButton"
              onClick={this.openDeclineModal}
            >
              {this.props.t('BuyOfferOrder.decline.offer')}
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
              <h2>{this.props.t('BuyOfferOrder.sell.confirmation')}</h2>
              <p>
                <Trans i18nKey="BuyOfferOrder.sell.conf.ask">
                  Do you confirm the sell of this <b>OVRLand</b>?
                </Trans>
              </p>
              <div className="Overlay__bid_container">
                <div className="OrderModal__bid">
                  <div className="Overlay__bid_title">
                    {this.props.t('BuyOfferOrder.sell.at')}
                  </div>
                  <div className="Overlay__bid_cont">
                    <ValueCounter value={this.props.offer.price}></ValueCounter>
                  </div>
                </div>
              </div>
              <p className="blinking-message">{this.state.metamaskMessage}</p>
              <div className="Modal__buttons_container">
                <HexButton
                  url="#"
                  text={this.props.t('Generic.confirm.label')}
                  className={
                    this.state.transactionInProcess
                      ? '--purple --disabled'
                      : '--purple'
                  }
                  onClick={() =>
                    this.confirmSell(
                      this.props.offer.id,
                      this.props.offer.landId
                    )
                  }
                ></HexButton>
                <HexButton
                  url="#"
                  text={this.props.t('Generic.cancel.label')}
                  className="--outline"
                  onClick={this.handleClose}
                ></HexButton>
              </div>
            </div>
          </Modal>

          <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={this.state.openDeclineBuyModal}
            onClose={this.handleClose}
          >
            <div className="BuyOfferModal">
              <h2>{this.props.t('BuyOfferOrder.decline.confirm')}</h2>
              <p>
                <Trans i18nKey="BuyOfferOrder.decline.conf.ask">
                  Do you confirm to decline this buy offer for this{' '}
                  <b>OVRLand</b>?
                </Trans>
              </p>
              <div className="Overlay__bid_container">
                <div className="OrderModal__bid">
                  <div className="Overlay__bid_title">
                    {this.props.t('BuyOfferOrder.sell.at')}
                  </div>
                  <div className="Overlay__bid_cont">
                    <ValueCounter value={this.props.offer.price}></ValueCounter>
                  </div>
                </div>
              </div>
              <p className="blinking-message">{this.state.metamaskMessage}</p>
              <div className="Modal__buttons_container">
                <HexButton
                  url="#"
                  text={this.props.t('Generic.confirm.label')}
                  className={
                    this.state.transactionInProcess
                      ? '--purple --disabled'
                      : '--purple'
                  }
                  onClick={() => this.declineBuyOffer(this.props.offer.id)}
                ></HexButton>
                <HexButton
                  url="#"
                  text={this.props.t('Generic.cancel.label')}
                  className="--outline"
                  onClick={this.handleClose}
                ></HexButton>
              </div>
            </div>
          </Modal>
        </>
      )
    } else {
      customRender = (
        <>
          <div className="section">
            <button
              type="button"
              className="orderTileButton"
              onClick={this.handleOpen}
            >
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
              <h2>{this.props.t('BuyOfferOrder.delete.confirmation')}</h2>
              <p>
                <Trans i18nKey="BuyOfferOrder.delete.ask">
                  Do you confirm the delete of this <b>Buy offer</b>?
                </Trans>
              </p>
              <p className="blinking-message">{this.state.metamaskMessage}</p>
              <div className="Modal__buttons_container">
                <HexButton
                  url="#"
                  text={this.props.t('Generic.confirm.label')}
                  className={
                    this.state.transactionInProcess
                      ? '--purple --disabled'
                      : '--purple'
                  }
                  onClick={() =>
                    this.confirmDeleteBuyOffer(this.props.offer.id)
                  }
                ></HexButton>
                <HexButton
                  url="#"
                  text={this.props.t('Generic.cancel.label')}
                  className="--outline"
                  onClick={this.handleClose}
                ></HexButton>
              </div>
            </div>
          </Modal>
        </>
      )
    }
    return customRender
  }

  render() {
    return (
      <div className="BuyOfferTile">
        <div className="section">
          <ValueCounter value={this.props.offer.price}></ValueCounter>
        </div>
        <div className="section">
          <b>{this.props.t('BuyOfferOrder.offer.order')}</b>
        </div>
        <div className="section">
          <span className="c-small-tile-text">
            {this.props.t('BuyOfferOrder.expires.label')}
          </span>{' '}
          <TimeCounter
            date_end={new Date(this.props.offer.expirationDate * 1000)}
          ></TimeCounter>
        </div>
        {this.buttonRender()}
      </div>
    )
  }
}

export default withUserContext(withWeb3Context(withMapContext(BuyOfferOrder)))
