import React, { Component } from 'react';
import ovr_token from '../../assets/icons/ovr_token.svg'
import { ReactSVG } from 'react-svg'

class ValueCounter extends Component {
    render() {
        return <div className="ValueCounter">
            <div className="ValueCounter__icon">
              <div className="Icon" >
                <ReactSVG src={ovr_token} 
                beforeInjection={svg => {
                  // let strokeValue = svg.querySelector('g').getAttribute('stroke')
                  // strokeValue = strokeValue.slice(0, 4) + svg.getAttribute('data-src') + strokeValue.slice(4)
                  // console.log(strokeValue)
                  // svg.querySelector('g').setAttribute('stroke', strokeValue)
                }}/>
                
              </div>
            </div>
            <div className="ValueCounter__value"> {this.props.value}</div>
        </div>;
    }
}

export default ValueCounter