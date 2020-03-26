import React, { Component } from 'react';
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import TimeCounter from '../../components/TimeCounter/TimeCounter';
import HexButton from '../../components/HexButton/HexButton';
import Modal from '@material-ui/core/Modal';

import { deleteSellLand } from '../../lib/api'
import { networkError, dangerNotification, successNotification} from '../../lib/notifications'


export class OpenSellOrder extends Component {
  constructor(props) {
    super(props)
    console.log("OpenSellOrderValues", props.order)
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
      } else {
        dangerNotification("Unable to delete sell order", response.data.errors[0].message)
      }
    }).catch(() => {
      // Notify user if network error
      networkError()
    });
  }

  handleOpen = () => {
    this.setState({openModal: true});
  };

  handleClose = () => {
    this.setState({ openModal: false });
  };

  componentDidMount() {

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
          <TimeCounter date_end={this.props.order.createdAt}></TimeCounter>
        </div>
        <div className="section">
          <button type="button" className="deleteButton" onClick={this.handleOpen}>
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
      </div>
    );
  }
}

export default OpenSellOrder;
