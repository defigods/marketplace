import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
// import { makeStyles } from '@material-ui/core/styles';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6

import { withMapContext } from '../../context/MapContext'
import { withUserContext } from '../../context/UserContext'

import Icon from '../Icon/Icon';
import ValueCounter from '../ValueCounter/ValueCounter';
import HexButton from '../HexButton/HexButton';

import { bidAuction } from '../../lib/api'
import { networkError, warningNotification } from '../../lib/notifications'
// import Stepper from '@material-ui/core/Stepper';
// import Step from '@material-ui/core/Step';

import white_hex from '../../assets/icons/white_hex.svg'
import left_arrow from '../../assets/icons/left_arrow.svg'
import close_overlay from '../../assets/icons/close_overlay.svg'

const BidOverlay = (props) => {  
  const [newBidValue, setNewBidValue] = useState('');
  const [bidInputError, setBidInputError] = useState(false);
  const [bidValid, setBidValid] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    if ((activeStep +1) === 1){
      if(!props.userProvider.state.isLoggedIn){
        warningNotification("Invalid authentication", "Please Log In to partecipate")
      } else {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
        sendBid();
      }
    } else {
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
  };

  useEffect(() => {
    console.log('bidoverlayuseeffect')
  }, [])

  // const handleBack = () => {
  //   setActiveStep(prevActiveStep => prevActiveStep - 1);
  // };

  const updateNewBidValue = (e) => {
    //Setup first time value
    if (newBidValue === ''){
      setNewBidValue(props.currentBid * 2); 
      setBidValid(true)
      return
    } else{
      setNewBidValue(e.target.value);  
    }

    //Check value if valid
    if (newBidValue < props.currentBid * 2){
      setBidInputError('Should be equal to or greater than Minimum bid')
      setBidValid(false)
    } else{
      setBidInputError(false)
      setBidValid(true)
    }
  }

  function sendBid(){
    // Call API function 
    bidAuction(props.land.key, newBidValue)
    .then((response) => {
      
      if (response.data.result === true) {
        console.log('responseTrue', response.data)
      } else {
        console.log('responseFalse', response.data)
      }
    }).catch(() => {
      // Notify user if network error
      networkError()
    });
  }

  function setDeactiveOverlay(e){
    e.preventDefault()
    props.mapProvider.actions.changeActiveBidOverlay(false)
  }
  
  function getStepContent(step) {
    switch (step) {
      case 0:
        return <div className="Overlay__body_cont">
              <div className="Overlay__upper">
                <div className="Overlay__title">Place a bid for the OVRLand</div>
                <div className="Overlay__land_title">{props.land.name.sentence}</div>
                <div className="Overlay__land_hex">{props.land.location}</div>
              </div>
              <div className="Overlay__lower">
                <div className="Overlay__bid_container">
                  <div className="Overlay__current_bid">
                    <div className="Overlay__bid_title">Current bid</div>
                    <div className="Overlay__bid_cont">
                    <ValueCounter value={props.currentBid}></ValueCounter> 
                    </div>
                  </div>
                  <div className="Overlay__arrow">
                    <Icon src={left_arrow} isSvg={true}></Icon>
                  </div>
                  <div className="Overlay__minimum_bid">
                    <div className="Overlay__bid_title">Minimum bid</div>
                    <div className="Overlay__bid_cont">
                    <ValueCounter value={props.currentBid * 2}></ValueCounter> 
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
                  <HexButton url="#" text="Place Bid" className={`--purple ${bidValid ? '' : '--disabled'}`} onClick={handleNext}></HexButton>
                  <HexButton url="#" text="Cancel" className="--outline" onClick={setDeactiveOverlay}></HexButton>
                </div>
              </div>
            </div>
      case 1:
        return <div className="Overlay__body_cont">
          <div className="Overlay__upper">
            <div className="Overlay__title">Bidding the OVRLand</div>
            <div className="Overlay__land_title">director.connect.overflow</div>
            <div className="Overlay__land_hex">Venice, Italy</div>
          </div>
          <div className="Overlay__lower">
            <div className="Overlay__bid_container">
              <div className="Overlay__current_bid">
                <div className="Overlay__bid_title">Current bid</div>
                <div className="Overlay__bid_cont">
                <ValueCounter value={props.currentBid}></ValueCounter> 
                </div>
              </div>
              <div className="Overlay__arrow">
                <Icon src={left_arrow} isSvg={true}></Icon>
              </div>
              <div className="Overlay__minimum_bid">
                <div className="Overlay__bid_title">Your bid</div>
                <div className="Overlay__bid_cont">
                  <ValueCounter value={newBidValue}></ValueCounter> 
                </div>
              </div>
            </div>
            <div className="Overlay__message__container">
              <span>
                Waiting for MetaMask confirmation
              </span>
            </div>
          </div>
        </div>
      case 2:
        return 'This is the bit I really care about!';
      default:
        return 'Unknown step';
    }
  }

  if (!props.mapProvider.state.activeBidOverlay) return null

  return <ReactCSSTransitionGroup
    transitionName="overlay"
    transitionAppear={true}
    transitionAppearTimeout={500}
    transitionEnter={false}
    transitionLeave={false}
    transitionLeaveTimeout={300}>
    <div key="bid-overlay-" to={props.url} className={`Overlay BidOverlay WhiteInputs ${props.className ? props.className : ''} --activeStep-${activeStep}`}>
          <div className="Overlay__cont">
            <Icon src={close_overlay} isSvg={true} className="Overlay__close_button" onClick={setDeactiveOverlay}></Icon>
            <div className="Overlay__hex_cont">
              <Icon src={white_hex} className='Overlay__hex' isSvg={true}></Icon>
            </div>
            {getStepContent(activeStep)}
          </div>
        </div>
      </ReactCSSTransitionGroup>;
}


export default withUserContext(withMapContext(BidOverlay));
