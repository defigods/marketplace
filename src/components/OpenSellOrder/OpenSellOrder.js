import React, { Component } from 'react';
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import TimeCounter from '../../components/TimeCounter/TimeCounter';
import HexButton from '../../components/HexButton/HexButton';
import Modal from '@material-ui/core/Modal';

import { deleteSellLand, buyLand } from '../../lib/api'
import { networkError, dangerNotification, successNotification, warningNotification} from '../../lib/notifications'


export class OpenSellOrder extends Component {
  constructor(props) {
    super(props)
    console.log("OpenSellOrderValues", props)
    this.state = {
      openModal: false
    }
  }
  
  confirmDeleteSell = () => {
    deleteSellLand(this.props.order.landUuid) // Call API function 
    .then((response) => {
      if (response.data.result === true) {
        successNotification("Action complete", "Delete of sell order complete")
        // this.props.realodLandStatefromApi(this.props.order.landUuid)
        this.handleClose()
      } else {
        dangerNotification("Unable to delete sell order", response.data.errors[0].message)
      }
    }).catch(() => {
      // Notify user if network error
      networkError()
    });
  }

  confirmBuy = () => {
    buyLand(this.props.order.landUuid) // Call API function 
    .then((response) => {
      if (response.data.result === true) {
        successNotification("Action complete", "Now you own this land")
        // this.props.realodLandStatefromApi(this.props.order.landUuid)
        this.handleClose()
      } else {
        dangerNotification("Unable to buy land", response.data.errors[0].message)
      }
    }).catch(() => {
      // Notify user if network error
      networkError()
    });
  }

  handleOpen = () => {
    if (this.props.userProvider.state.isLoggedIn){
      this.setState({ openModal: true });
    } else {
      warningNotification("Invalid authentication", "Please Log In to buy land")
    } 
    
  };

  handleClose = () => {
    this.setState({ openModal: false });
  };

  componentDidMount() {

  }

  buttonRender = () => {
    let customRender;
    if(this.props.userPerspective === 1 ){
      customRender = <>
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
        <div className="SellOrderModal">
          <h2>Delete confirmation</h2>
          <p>
            Do you confirm the delete of this <b>Open Sell Order</b>?
          </p>
          <div className="Modal__buttons_container">
            <HexButton url="#" text="Confirm" className={`--purple`} onClick={this.confirmDeleteSell}></HexButton>
            <HexButton url="#" text="Cancel" className="--outline" onClick={this.handleClose}></HexButton>
          </div>
        </div>
      </Modal>
      </>
    } else {
      customRender = <>
      <div className="section">
        <button type="button" className="orderTileButton" onClick={this.handleOpen}>
          Buy now
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
          <h2>Buy confirmation</h2>
          <p>
            Do you confirm the buy of this <b>OVRLand</b>?
        </p>
          <div className="Overlay__bid_container">
            <div className="OrderModal__bid">
              <div className="Overlay__bid_title">Buy for</div>
              <div className="Overlay__bid_cont">
                <ValueCounter value={this.props.order.worth}></ValueCounter>
              </div>
            </div>
          </div>
          <div className="Modal__buttons_container">
            <HexButton url="#" text="Confirm" className={`--purple`} onClick={this.confirmBuy}></HexButton>
            <HexButton url="#" text="Cancel" className="--outline" onClick={this.handleClose}></HexButton>
          </div>
        </div>
      </Modal>
      </>
    }
    return customRender;
  }


  render() {
    return (
      <div className="SellOrderTile">
        <div className="section">
          <ValueCounter value={this.props.order.worth}></ValueCounter>
        </div>
        <div className="section">
          <b>Open Sell Order</b>
        </div>
        <div className="section">
          <span className="c-small-tile-text">Placed</span> <TimeCounter date_end={this.props.order.createdAt}></TimeCounter>
        </div>
        {this.buttonRender()}
      </div>
    );
  }
}

export default OpenSellOrder;
