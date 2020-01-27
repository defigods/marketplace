import React, {Component} from 'react';
import './style.scss';
import { withMapContext } from '../../context/MapContext'
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import TimeCounter from '../../components/TimeCounter/TimeCounter';


export class Land extends Component {
  constructor(props) {
    super(props)
    this.state = {
        key: "8cbcc350c0ab5ff",
        value:"300",
        name:{sentence:"director.connect.overflow", hex: "8cbcc350c0ab5ff"},
        location:"Venice, Italy",
        bid_status:{className: "--best", sentence:"BEST BID"},
        date_end:"2020-01-17T15:44-0000",
    }
  }

  componentDidMount(){
    const hex_id = this.props.match.params.id
    this.props.mapProvider.actions.changeHexId(hex_id)
  }
  componentWillUnmount(){
    
  }

  render(){
    return (
      <div className="Land">
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
                <TimeCounter time={20} signature="mins" date_end={this.state.date_end}></TimeCounter>
              </div>
              <div className="o-fourth">
                <h3 className="o-small-title">Status</h3>
              </div>
              <div className="o-fourth">
                <h3 className="o-small-title">Price</h3>
              </div>
            </div>
          </div>
          <div className="o-auction-list">
            <div className="o-container">

            </div>
          </div>
      </div>
    );
  }
}

export default withMapContext(Land);
