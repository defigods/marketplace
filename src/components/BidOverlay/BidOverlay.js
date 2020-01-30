import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6

import { withMapContext } from '../../context/MapContext'

import Icon from '../Icon/Icon';
import ValueCounter from '../ValueCounter/ValueCounter';
import HexButton from '../HexButton/HexButton';

import white_hex from '../../assets/icons/white_hex.svg'
import left_arrow from '../../assets/icons/left_arrow.svg'

const BidOverlay = (props) => {
  
  const [currentBid, currentBidValue] = useState(30000);
  const [newBidValue, setNewBidValue] = useState('');
  const [bidInputError, setBidInputError] = useState(false);
  const [bidValid, setBidValid] = useState(false);
  let input

  const updateNewBidValue = (e) => {
    //Setup first time value
    if (newBidValue === ''){
      setNewBidValue(currentBid * 2); 
      setBidValid(true)
      return
    } else{
      setNewBidValue(e.target.value);  
    }

    //Check value if valid
    if (newBidValue < currentBid * 2){
      setBidInputError('Should be equal to or greater than Minimum bid')
      setBidValid(false)
    } else{
      setBidInputError(false)
      setBidValid(true)
    }
  }

  function setDeactiveOverlay(e){
    e.preventDefault()
    props.mapProvider.actions.changeActiveBidOverlay(false)
  }
  

  if (!props.mapProvider.state.activeBidOverlay) return null

  return <ReactCSSTransitionGroup
    transitionName="overlay"
    transitionAppear={true}
    transitionAppearTimeout={500}
    transitionEnter={false}
    transitionLeave={false}>
      <div key="bid-overlay-" to={props.url} className={`Overlay BidOverlay ${props.className ? props.className : ''}`}>
          <div className="Overlay__cont">
            <div className="Overlay__hex_cont">
              <Icon src={white_hex} className='Overlay__hex' isSvg={true}></Icon>
            </div>
            <div className="Overlay__body_cont">
              <div className="Overlay__upper">
                <div className="Overlay__title">Place a bid for the OVRLand</div>
                <div className="Overlay__land_title">director.connect.overflow</div>
                <div className="Overlay__land_hex">Venice, Italy</div>
              </div>
              <div className="Overlay__lower">
                <div className="Overlay__bid_container">
                  <div className="Overlay__current_bid">
                    <div className="Overlay__bid_title">Current bid</div>
                    <div className="Overlay__bid_cont">
                    <ValueCounter value={currentBid}></ValueCounter> 
                    </div>
                  </div>
                  <div className="Overlay__arrow">
                    <Icon src={left_arrow} isSvg={true}></Icon>
                  </div>
                  <div className="Overlay__minimum_bid">
                    <div className="Overlay__bid_title">Minimum bid</div>
                    <div className="Overlay__bid_cont">
                    <ValueCounter value={currentBid * 2}></ValueCounter> 
                    </div>
                  </div>
                </div>
                <div className="Overlay__input">
                  <TextField
                    id="quantity"
                    label="Your Bid"
                    type="number"
                    error={bidInputError !== false ? true : false}
                    helperText={bidInputError !== false ? bidInputError : ""}
                    value={newBidValue} 
                    onFocus={updateNewBidValue}
                    onChange={updateNewBidValue}
                    onKeyUp={updateNewBidValue}
                  />
                </div>
                <div className="Overlay__buttons_container">
                  <HexButton url="" text="Place Bid" className={`--purple ${bidValid ? '':'--disabled'}`}></HexButton>
                  <HexButton url="" text="Cancel" className="--outline" onClick={setDeactiveOverlay}></HexButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ReactCSSTransitionGroup>;
}


export default withMapContext(BidOverlay);
