import React, { useState } from 'react';
import { store } from 'react-notifications-component';
import { Link } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import HexButton from '../../components/HexButton/HexButton';
import { withUserContext } from '../../context/UserContext'

import { signUp } from '../../lib/api'


/** 
* Signup page component
*/

const Signup = (props) => {

  const [signupName, setSignupName] = useState('')
  const [inputNameError] = useState(false)

  const [signupPassword, setSignupPassword] = useState('')
  const [inputPasswordError] = useState(false)

  const [signupEmail, setSignupEmail] = useState('')
  const [inputEmailError] = useState(false)

  const [isFormValid, setIsFormValid] = useState(false);

  // 
  // State management and form control
  //  
  const checkFormValidity = () => {
    if (signupPassword === "" || signupName === "" || signupEmail === "") {
      setIsFormValid(false)
    } else {
      setIsFormValid(true)
    }
  }

  const changeSignupName = (e) => {
    setSignupName(e.target.value)
    checkFormValidity()
  }

  const changeSignupEmail = (e) => {
    setSignupEmail(e.target.value)
    checkFormValidity()
  } 

  const changeSignupPassword = (e) => {
    setSignupPassword(e.target.value)
    checkFormValidity()
  }

  // Submit signup function, call api's manage state contest 

  const submitSignup = (e) => {
    // Call API function 
    console.log(signupName, signupPassword, signupEmail)
    signUp(signupName, signupPassword, signupEmail)
      .then((response) => {
        console.log(response)
        console.log(response.data.result)
        if (response.data.result === true) {
          // Notify user
          store.addNotification({
            title: "Signup complete",
            message: "Now you can log in",
            type: "success",
            insert: "top",
            container: "top-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            showIcon: true,
            dismiss: {
              duration: 5000
            }
          })
        } else {
          // Notify user if signup fail
          store.addNotification({
            title: "Signup failed",
            message: response.data.errors[0].message,
            type: "danger",
            insert: "top",
            container: "top-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            showIcon: true,
            dismiss: {
              duration: 5000
            }
          })
        }
      }).catch(() => {
        console.log('catch')
        // Notify user if network error
        store.addNotification({
          title: "Connection error",
          message: "Check your internet connection or try again later",
          type: "danger",
          insert: "top",
          container: "top-right",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          showIcon: true,
          dismiss: {
            duration: 5000
          }
        })
      });

  }

  // 
  // Return
  //  

  return <div className="Signup">
    <div className="o-container">
      <h2>Sign up to OVR</h2>
      <div className="Signup__sub-title">
        We're so pleased you're here. As a user will own and exchange lands using your account.
        </div>
      <div className="Signup__form-container">
        <div className="Signup__input">
          <TextField
            id="signupName"
            label="Username"
            type="text"
            error={inputNameError !== false ? true : false}
            helperText={inputNameError !== false ? inputNameError : ""}
            onFocus={changeSignupName}
            onChange={changeSignupName}
            onKeyUp={changeSignupName}
          />
        </div>
        <div className="Signup__input">
          <TextField
            id="signupEmail"
            label="Email"
            type="text"
            error={inputEmailError !== false ? true : false}
            helperText={inputEmailError !== false ? inputEmailError : ""}
            onFocus={changeSignupEmail}
            onChange={changeSignupEmail}
            onKeyUp={changeSignupEmail}
          />
        </div>
        <div className="Signup__input">
          <TextField
            id="signupPassword"
            label="Password"
            type="password"
            error={inputPasswordError !== false ? true : false}
            helperText={inputPasswordError !== false ? inputPasswordError : ""}
            onFocus={changeSignupPassword}
            onChange={changeSignupPassword}
            onKeyUp={changeSignupPassword}
          />
        </div>
        <div className="Signup__input">
          <HexButton url="#" text="Signup" className={`--purple ${isFormValid ? '' : '--disabled'}`} onClick={submitSignup}></HexButton>
        </div>
      </div>
      <div className="Signup__signup">
        You have an account? <Link to="/login">Login</Link>
      </div>
      <div className="Signup__footer">
        If you have any question about registration visit <Link to="/FAQs">FAQs</Link> or contact <Link to="mailto:info@ovr.ai">info@ovr.ai</Link>
      </div>

    </div>
  </div>


}

export default withUserContext(Signup);

