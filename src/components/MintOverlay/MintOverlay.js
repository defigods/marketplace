import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
// import { makeStyles } from '@material-ui/core/styles';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6

import { withMapContext } from '../../context/MapContext'
import { withUserContext } from '../../context/UserContext'

import Icon from '../Icon/Icon';
import ValueCounter from '../ValueCounter/ValueCounter';
import HexButton from '../HexButton/HexButton';
import { mintLand } from '../../lib/api'
import { networkError, warningNotification, dangerNotification } from '../../lib/notifications'

// import Stepper from '@material-ui/core/Stepper';
// import Step from '@material-ui/core/Step';

import white_hex from '../../white_hex.svg'
import close_overlay from '../../close_overlay.svg'

const MintOverlay = (props) => {
  const [currentBid] = useState(10);
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
        //  TODO Remove timeout
        setTimeout(function () { sendMint(); }, 1500);
      }
    } else {
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
  };

  // const handleBack = () => {
  //   setActiveStep(prevActiveStep => prevActiveStep - 1);
  // };

  const updateNewBidValue = (e) => {
    //Setup first time value
    if (newBidValue === '') {
      setNewBidValue(currentBid);
      setBidValid(true)
      return
    } else {
      setNewBidValue(e.target.value);
    }

    //Check value if valid
    if (newBidValue < 10) {
      setBidInputError('Should be equal to or greater than Minimum bid')
      setBidValid(false)
    } else {
      setBidInputError(false)
      setBidValid(true)
    }
  }

  function setDeactiveOverlay(e) {
    e.preventDefault()
    props.mapProvider.actions.changeActiveMintOverlay(false)
    setActiveStep(0)
  }

  function sendMint(){
    // Call API function 
    mintLand(props.land.key, newBidValue)
    .then((response) => {

      if (response.data.result === true) {
        console.log('responseTrue', response.data)
        props.realodLandStatefromApi(props.land.key)
        console.log("props.land.key",props)
        setActiveStep(2);
      } else {
        // response.data.errors[0].message
        console.log('responseFalse')
        // if (response.data.errors){
        //   dangerNotification("Unable to mint land", response.data.errors[0].message)
        // }
        dangerNotification("Unable to mint land", response.data.errors[0].message)
        setActiveStep(0);
      }
    }).catch((error) => {
      // Notify user if network error
      console.log(error)
      networkError()
    });
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
              <div className="Overlay__minimum_bid">
                <div className="Overlay__bid_title">Minimum bid</div>
                <div className="Overlay__bid_cont">
                  <ValueCounter value={currentBid}></ValueCounter>
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
            <div className="Overlay__land_title">{props.land.name.sentence}</div>
            <div className="Overlay__land_hex">{props.land.location}</div>
          </div>
          <div className="Overlay__lower">
            <div className="Overlay__bid_container">
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
        return <div className="Overlay__body_cont">
          <div className="Overlay__upper">
            <div className="Overlay__title">Minting the OVRLand</div>
            <div className="Overlay__land_title">{props.land.name.sentence}</div>
            <div className="Overlay__land_hex">{props.land.location}</div>
          </div>
          <div className="Overlay__lower">
            <div className="Overlay__bid_container">
              <div className="Overlay__current_bid">
                <div className="Overlay__bid_title">Current bid</div>
                <div className="Overlay__bid_cont">
                  <ValueCounter value={newBidValue}></ValueCounter> 
                </div>
              </div>
            </div>
            <div className="Overlay__message__container">
              <span>
                Mint confirmed
              </span>
            </div>
            <div className="Overlay__buttons_container">
              <HexButton url="#" text="Close" className="--outline" onClick={setDeactiveOverlay}></HexButton>
            </div>
          </div>
        </div>
      default:
        return 'Unknown step';
    }
  }

  if (!props.mapProvider.state.activeMintOverlay) return null

  return <ReactCSSTransitionGroup
    transitionName="overlay"
    transitionAppear={true}
    transitionAppearTimeout={500}
    transitionEnter={false}
    transitionLeave={false}
    transitionLeaveTimeout={300}>
    <div key="mint-overlay-" to={props.url} className={`Overlay MintOverlay WhiteInputs ${props.className ? props.className : ''} --activeStep-${activeStep}`}>
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


export default withUserContext(withMapContext(MintOverlay));
