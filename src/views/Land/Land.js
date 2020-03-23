import React, { Component } from 'react';
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
      value: 10,
      name: { sentence: "director.connect.overflow", hex: "8cbcc350c0ab5ff" },
      location: "Venice, Italy",
      marketStatus: 0,
      userPerspective: 0,
      auction: null,
      bidHistory: []
    }
    this.mapActions = this.props.mapProvider.actions
  }

  loadLandStateFromApi(hex_id) {
    // Call API function 
    console.log('reload api')
    getLand(hex_id)
      .then((response) => {

        let data = response.data
        console.log("landApiData", data)

        if (data.auction != null) {
          this.setState({
            value: data.auction.currentWorth,
            auction: data.auction,
            bidHistory: data.auction.bidHistory
          })
        } else {
          this.setState({
            value: data.value,
            bidHistory: []
          })
        }

        this.setState({
          key: data.uuid,
          name: { sentence: data.sentenceId, hex: data.uuid },
          location: data.address.full,
          marketStatus: data.marketStatus,
          userPerspective: data.userPerspective
        })


      }).catch((error) => {
        // Notify user if network error
        console.log(error)
        networkError()
      });
  }

  componentDidMount() {
    const hex_id = this.props.match.params.id
    // Focus map on hex_id 
    this.mapActions.changeHexId(hex_id)
    // Load data from API
    this.loadLandStateFromApi(hex_id)
  }

  componentDidUpdate(prevProps) {
    // If param change load data from API
    if (this.props.location !== prevProps.location ||
      this.props.value !== prevProps.value) {
      const hex_id = this.props.match.params.id
      this.loadLandStateFromApi(hex_id)
      this.mapActions.changeHexId(hex_id)
      console.log('didupdateinsideif')
    }
    console.log('didupdate')
  }

  componentWillUnmount(){
    this.mapActions.changeActiveBidOverlay(false)
    this.mapActions.changeActiveMintOverlay(false)
  }

  setActiveBidOverlay(e) {
    e.preventDefault()
    if (this.props.userProvider.state.isLoggedIn === false) {
      // TODO remove comment
      // warningNotification("Invalid authentication", "Please Log In to partecipate")
      // this.props.history.push("/login")
    } else {
      // this.mapActions.changeActiveBidOverlay(true)
    }
    this.mapActions.changeActiveBidOverlay(true) // TODO COMMENT
  }

  setActiveMintOverlay(e) {
    e.preventDefault()
    if (this.props.userProvider.state.isLoggedIn === false) {
      // TODO remove comment
      // warningNotification("Invalid authentication", "Please Log In to partecipate")
      // this.props.history.push("/login")
    } else {
      // this.mapActions.changeActiveMintOverlay(true)
    }

    this.mapActions.changeActiveMintOverlay(true) // TODO COMMENT
  }

  realodLandStatefromApi = (value) => {
    // TODO Change with socket
    let that = this
    setTimeout(function(){
      that.loadLandStateFromApi(value)
    }, 1500)
  }

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
      )
    } else {
      return <div>&nbsp;</div>
    }
  }

  renderBadge() {
    let badge = <div>&nbsp;</div>
    switch (this.state.marketStatus) {
      case 1:
        badge = <div><h3 className="o-small-title">Status</h3><div className="c-status-badge  --open">OPEN</div></div>
        break
      case 2:
        badge = <div><h3 className="o-small-title">Status</h3><div className="c-status-badge  --owned">OWNED</div></div>
        break
      default:
        badge = <div>&nbsp;</div>
    }

    switch (this.state.userPerspective) {
      case 1:
        badge = <div><h3 className="o-small-title">Status</h3><div className="c-status-badge --bestbid">OWNER</div></div>
        break
      case 2:
        badge = <div><h3 className="o-small-title">Status</h3><div className="c-status-badge  --bestbid">BEST BID</div></div>
        break
      case 3:
        badge = <div><h3 className="o-small-title">Status</h3><div className="c-status-badge  --outbidded">OUTBIDDED</div></div>
        break
      default:
        break
    }

    return badge
  }

  renderOverlayButton() {
    switch (this.state.marketStatus) {
      case 0:
        return <HexButton url="/" text="Init Auction" className="" onClick={(e) => this.setActiveMintOverlay(e)}></HexButton>
      case 1:
        return <HexButton url="/" text="Place bid" className="--purple" onClick={(e) => this.setActiveBidOverlay(e)}></HexButton>
      case 2:
        return <div>&nbsp;</div>
      default:
        return <div>&nbsp;</div>
    }
  }

  renderPrice() {
    switch (this.state.marketStatus) {
      case 2:
        return <>
          <h3 className="o-small-title">Closing price</h3>
          <ValueCounter value={this.state.value}></ValueCounter>
        </>
      default:
        return <>
          <h3 className="o-small-title">Price</h3>
          <ValueCounter value={this.state.value}></ValueCounter>
        </>
    }
  }

  renderBidHistory(){
    if(this.state.bidHistory.length === 0){
      return <div className="o-container">
        <div className="Title__container"> <h3 className="o-small-title">History</h3></div>
        <div className="c-dialog --centered">
          <div className="c-dialog-main-title">
            Be the one to start an auction <span role="img" aria-label="fire-emoji">🔥</span>
          </div>
          <div className="c-dialog-sub-title">
            The land has no active Auction at the moment. <br></br>Click on "Init Auction" and be the one to own it.
          </div>
        </div>
      </div>
    } else {
      return <div className="o-container">
        <div className="Title__container"> <h3 className="o-small-title">Bid History</h3></div>
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
              {this.state.bidHistory.map((bid) =>
                <tr className="Table__line">
                  <td><ValueCounter value={bid.worth}></ValueCounter> </td>
                  <td><TimeCounter date_end={bid.when}></TimeCounter></td>
                  <td>{bid.from}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div> 
      </div>
    }
  }

  render() {
    return (
      <div className="Land">
        <BidOverlay currentBid={this.state.value} land={this.state} realodLandStatefromApi={this.realodLandStatefromApi}></BidOverlay>
        <MintOverlay currentBid={this.state.value} land={this.state} realodLandStatefromApi={this.realodLandStatefromApi}></MintOverlay>
        <div className="o-container">
          <div className="Land__heading__1">
            <h2>{this.state.name.sentence}</h2>
            <div className="Land__location">{this.state.location}</div>
          </div>
          <div className="Land__heading__2">
            <div className="o-fourth">
              {this.renderPrice()}
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
          {this.renderBidHistory()}
        </div>
      </div>
    );
  }
}

export default withUserContext(withMapContext(Land));
