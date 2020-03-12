import React, {Component} from 'react';
import './style.scss';
import { withMapContext } from '../../context/MapContext'
import { withUserContext } from '../../context/UserContext'
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import TimeCounter from '../../components/TimeCounter/TimeCounter';
import HexButton from '../../components/HexButton/HexButton';
import BidOverlay from '../../components/BidOverlay/BidOverlay';
import MintOverlay from '../../components/MintOverlay/MintOverlay';

import { getLand } from '../../lib/api'
import { networkError, warningNotification } from '../../lib/notifications'


export class Land extends Component {
  constructor(props) {
    super(props)
    console.log("LandProps", props)
    this.state = {
        key: "8cbcc350c0ab5ff",
        value:10,
        name:{sentence:"director.connect.overflow", hex: "8cbcc350c0ab5ff"},
        location:"Venice, Italy",
        marketStatus: 0,
        auction: null
    }
    this.mapActions = this.props.mapProvider.actions 
  }

  componentDidMount(){
    const hex_id = this.props.match.params.id
    // Focus map on hex_id 
    this.mapActions.changeHexId(hex_id)

    // Call API function 
    getLand(hex_id)
    .then((response) => {

      let data = response.data 
      console.log("landApiData",data)

      if(data.auction != null){
        this.setState({
          value: data.auction.currentWorth,
          auction: data.auction
        })
        console.log('there is auction')
      }

      this.setState({
        key: data.uuid,
        name: { sentence: data.sentenceId, hex: data.uuid },
        location: data.address.full,
        marketStatus: data.marketStatus
        // bid_status:{className: "--bestbid", sentence:"BEST BID"},
      })
      

    }).catch(() => {
      // Notify user if network error
      networkError()
    });
  }

  setActiveBidOverlay(e){
    e.preventDefault()
    if (this.props.userProvider.state.isLoggedIn === false){
      // TODO remove comment
      // warningNotification("Invalid authentication", "Please Log In to partecipate")
      // this.props.history.push("/login")
    } else {
      // this.mapActions.changeActiveBidOverlay(true)
    }
    this.mapActions.changeActiveBidOverlay(true) // TODO COMMENT
  }

  setActiveMintOverlay(e){
    e.preventDefault()
    if (this.props.userProvider.state.isLoggedIn === false){
      // TODO remove comment
      // warningNotification("Invalid authentication", "Please Log In to partecipate")
      // this.props.history.push("/login")
    } else {
      // this.mapActions.changeActiveMintOverlay(true)
    }

    this.mapActions.changeActiveMintOverlay(true) // TODO COMMENT
  }

  // 
  // Render elements
  // 

  renderTimer(){
    if (this.state.marketStatus === 1){
    return (
    <>
      <h3 className="o-small-title">Time Left</h3>
      <TimeCounter date_end={this.state.auction.closeAt}></TimeCounter>
    </> 
    )
    } else {
      return <div>&nbsp;</div>
    }
  }

  renderBadge(){
    switch (this.state.marketStatus) {
      case 0:
        return <div>&nbsp;</div>
      case 1:
        return <>
          <h3 className="o-small-title">Status</h3>
          <div className="c-status-badge  --open">OPEN</div>
        </>
      case 2:
        return <>
          <h3 className="o-small-title">Status</h3>
          <div className="c-status-badge  --owned">OWNED</div>
        </>
      default:
        return <div>&nbsp;</div>
    }
  }

  renderOverlayButton(){
    switch (this.state.marketStatus) {
      case 0:
        return <HexButton url="/" text="Mint Land" className="" onClick={(e) => this.setActiveMintOverlay(e)}></HexButton>
      case 1:
        return <HexButton url="/" text="Place bid" className="--purple" onClick={(e) => this.setActiveBidOverlay(e)}></HexButton>
      case 2:
        return <div>&nbsp;</div>
      default:
        return <div>&nbsp;</div>
    }
  }

  render(){
    return (
      <div className="Land">
        <BidOverlay currentBid={this.state.value} land={this.state}></BidOverlay>
        <MintOverlay currentBid={this.state.value} land={this.state}></MintOverlay>
          <div className="o-container">
            <div className="Land__heading__1">
              <h2>{this.state.name.sentence}</h2>
              <div className="Land__location">{this.state.location}</div>
            </div>
            <div className="Land__heading__2">
              <div className="o-fourth">
                <h3 className="o-small-title">Price</h3>
                <ValueCounter value={this.state.value}></ValueCounter> 
              </div>
              <div className="o-fourth">
                {this.renderTimer()}
              </div>
              <div className="o-fourth">
                {this.renderBadge()}
              </div>
              <div className="o-fourth">
                {this.renderOverlayButton()}
              </div>
            </div>
          </div>
          <div className="Land__section">
            <div className="o-container">
              <div className="Title__container"> <h3 className="o-small-title">Bid History</h3></div>
              <div className="Table__container">
                <table className="Table">
                  <thead>
                    <tr>
                      <th>Price</th>
                      <th>When</th>
                      <th>From</th>
                      <th>To</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="Table__line">
                      <td><ValueCounter value="200000"></ValueCounter> </td>
                      <td><TimeCounter date_end={this.state.date_end}></TimeCounter></td>
                      <td>0x83b7</td>
                      <td>0x83b7</td>
                    </tr>
                    <tr className="Table__line">
                      <td><ValueCounter value="200000"></ValueCounter> </td>
                      <td><TimeCounter date_end={this.state.date_end}></TimeCounter></td>
                      <td>0x83b7</td>
                      <td>0x83b7</td>
                    </tr>
                    <tr className="Table__line">
                      <td><ValueCounter value="200000"></ValueCounter> </td>
                      <td><TimeCounter date_end={this.state.date_end}></TimeCounter></td>
                      <td>0x83b7</td>
                      <td>0x83b7</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
      </div>
    );
  }
}

export default withUserContext(withMapContext(Land));
