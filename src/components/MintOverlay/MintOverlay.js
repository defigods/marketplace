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
    if (newBidValue >= 10) {
      setBidValid(true)
    } else {
      setBidValid(false)
    }

    setNewBidValue(e.target.value);
  }

  function setDeactiveOverlay(e) {
    e.preventDefault()
    props.mapProvider.actions.changeActiveMintOverlay(false)
    setActiveStep(0)
  }

  function sendMint(){
    // //Check value if valid
    // if (newBidValue < 10) {
    //   setBidInputError('Should be equal to or greater than Minimum bid')
    //   setBidValid(false)
    //   return false
    // } 

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
        <div className={`Icon Overlay__close_button`} onClick={setDeactiveOverlay}>
          <svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
              <g id="Dashboards" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" fill-opacity="0.5">
                  <g id="Biddign-Single-Auction" transform="translate(-398.000000, -298.000000)" fill="#FFFFFF" fill-rule="nonzero">
                      <path d="M413,298 C404.715729,298 398,304.715729 398,313 C398,321.284271 404.715729,328 413,328 C421.284271,328 428,321.284271 428,313 C427.989405,304.720121 421.279879,298.010595 413,298 Z M417.369533,315.697384 C417.829203,316.159016 417.829203,316.90686 417.369533,317.368492 C416.90929,317.82955 416.163695,317.82955 415.703452,317.368492 L413,314.656882 L410.296548,317.368492 C409.836305,317.82955 409.09071,317.82955 408.630467,317.368492 C408.170797,316.90686 408.170797,316.159016 408.630467,315.697384 L411.333919,312.985774 L408.630467,310.274164 C408.197665,309.808287 408.210436,309.082301 408.659354,308.632029 C409.108271,308.181756 409.832073,308.168947 410.296548,308.603055 L413,311.314665 L415.703452,308.603055 C416.167927,308.168947 416.891729,308.181756 417.340646,308.632029 C417.789564,309.082301 417.802335,309.808287 417.369533,310.274164 L414.666081,312.985774 L417.369533,315.697384 Z" id="Shape"></path>
                  </g>
              </g>
          </svg>
        </div>
        <div className="Overlay__hex_cont">
          <div className={`Icon Overlay__hex`} >
            <svg width="152px" height="176px" viewBox="0 0 152 176" version="1.1" xmlns="http://www.w3.org/2000/svg" >
                <g id="Dashboards" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" fill-opacity="0.2">
                    <g id="Biddign-Single-Auction" transform="translate(-439.000000, -349.000000)" fill="#FFFFFF" stroke="#FFFFFF">
                        <polygon id="Polygon" transform="translate(515.000000, 437.000000) rotate(-360.000000) translate(-515.000000, -437.000000) " points="515 350 590.34421 393.5 590.34421 480.5 515 524 439.65579 480.5 439.65579 393.5"></polygon>
                    </g>
                </g>
            </svg>
          </div>
        </div>
        {getStepContent(activeStep)}
      </div>
    </div>
  </ReactCSSTransitionGroup>;
}


export default withUserContext(withMapContext(MintOverlay));
