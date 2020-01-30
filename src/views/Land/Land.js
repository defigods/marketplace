import React, {Component} from 'react';
import './style.scss';
import { withMapContext } from '../../context/MapContext'
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import TimeCounter from '../../components/TimeCounter/TimeCounter';
import HexButton from '../../components/HexButton/HexButton';
import BidOverlay from '../../components/BidOverlay/BidOverlay';


export class Land extends Component {
  constructor(props) {
    super(props)
    this.state = {
        key: "8cbcc350c0ab5ff",
        value:"300",
        name:{sentence:"director.connect.overflow", hex: "8cbcc350c0ab5ff"},
        location:"Venice, Italy",
        bid_status:{className: "--bestbid", sentence:"BEST BID"},
        date_end:"2020-01-17T15:44-0000",
        activeOverlay: false
    }
    this.mapActions = this.props.mapProvider.actions 
  }
  

  componentDidMount(){
    const hex_id = this.props.match.params.id
    this.mapActions.changeHexId(hex_id)
  }

  // componentWillUnmount(){
    
  // }

  setActiveOverlay(e){
    e.preventDefault()
    this.mapActions.changeActiveBidOverlay(true)
  }

  render(){
    return (
      <div className="Land">
        <BidOverlay></BidOverlay>
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
                <h3 className="o-small-title">Time Left</h3>
                <TimeCounter date_end={this.state.date_end}></TimeCounter>
              </div>
              <div className="o-fourth">
                <h3 className="o-small-title">Status</h3>
                <div className="c-status-badge  --bestbid">BEST BID</div>
              </div>
              <div className="o-fourth">
                <HexButton url="/" text="Place Bid" className="--purple" onClick={(e)=> this.setActiveOverlay(e)}></HexButton>
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

export default withMapContext(Land);
