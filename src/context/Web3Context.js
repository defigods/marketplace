import React, { createContext, Component } from 'react';
import { removeToken, saveToken, isLogged, getToken, removeUser } from '../lib/auth';
import { successNotification, networkError, dangerNotification, warningNotification } from '../lib/notifications';
import { userProfile, getUserNonce, signUpPublicAddress, signIn, sendPreAuctionStart, sendConfirmAuctionStart, sendPreAuctionBid, signUpLoginMetamask } from '../lib/api';
import {promisify} from '../lib/config';
import config from '../lib/config';
import { promisifyAll } from 'bluebird';
import { ethers } from 'ethers';
import { UserContext } from './UserContext';
import { useHistory } from 'react-router-dom';
import {abi} from '../contract/abi';

export const Web3Context = createContext();

export class Web3Provider extends Component {
  static contextType = UserContext;
  constructor(props) {
    super(props);
    this.state = {
			setupComplete: false,
			provider: null,
			signer: null,
      address: null,
      ovrsOwned: 0,
      perEth: 0,
      perUsd: 0,
      lastTransaction: "0x0"
    };
  }

  componentDidMount() {
    // If logged setup Web3
    if (isLogged()) {
      this.setupWeb3((res) =>{
        if( res == false ){
          this.context.actions.logoutUser();
        } 
      }, false)
    }
  }

  setupWeb3 = async (callback, login=true) => {
		if (typeof web3 !== "undefined") {
			await window.ethereum.enable();
			let provider = new ethers.providers.Web3Provider(window.ethereum);
			let network = await provider.getNetwork();
			let chainId = network.chainId;
			let signer = provider.getSigner(0);
			let address = await signer.getAddress();
			
			if (address == undefined) {
				// Metamask found, but not logged in
				callback(false)
			} else {
				// Metamask found, logged in, check chainId
				let web3NetworkVersion = parseInt(chainId) === config.web3network;
				if( web3NetworkVersion === false ) {
					// Wrong Network
          warningNotification(this.props.t('Warning.metamask.wrong.network.title'), this.props.t('Warning.metamask.wrong.network.desc'));
					callback(false);
					return false;
				}
				// Metamask found, logged in, chainId correct
				this.setState({
					"provider": provider,
					"signer": signer,
					"address": address,
					"chainId": chainId
				});

        // Centralized Login
        if(login == true){
          await this.handleCentralizedLogin(address, callback)
        }
			}
		} else {
			// Metamask not detected
			warningNotification(this.props.t('Warning.metamask.not.detected.title'), this.props.t('Warning.metamask.not.detected.desc'));
			callback(false);
			return false;
		}
  };
	
	getUSDValueInOvr = (usd = 1) => {
		let floorValue = 0.1;
		// TODO get value of OVR token and if it's more than 0.1 use it as floor
		return (usd / floorValue).toFixed(2);
	}


  //
  // Centralized authentication with Metamask
  //

  handleCentralizedLogin(publicAddress, callback) {
		signUpLoginMetamask(publicAddress).then((response) => {
			console.log('response', response)
			getUserNonce(publicAddress).then((response) => {
				console.log('response', response)
					if (response.data.result === true) {
							let nonce = response.data.user.nonce;
							this.handleUserSignMessage(publicAddress, nonce, callback);
					} 
			});
		});
  }

  handleUserSignMessage = async (publicAddress, nonce, callback) => {
		let signature = await this.state.signer.signMessage(`I am signing my one-time nonce: ${nonce}`)
		this.handleAuthenticate(publicAddress, signature, callback);
  };

  handleAuthenticate = (publicAddress, signature, callback) => {
    signIn(publicAddress, signature).then((response) => {
      if (response.data.result === true) {
        // Save data in store
        this.context.actions.loginUser(response.data.token, response.data.user);
        if (callback) {
          callback();
        }
      } else {
        dangerNotification(this.props.t('Danger.unable.login.title'), response.data.errors[0].message);
      }
    });
  };

  render() {
    return (
      <Web3Context.Provider
        value={{
          state: this.state,
          actions: {
						setupWeb3: this.setupWeb3,
						getUSDValueInOvr: this.getUSDValueInOvr
          },
        }}
      >
        {this.props.children}
      </Web3Context.Provider>
    );
  }
}

export function withWeb3Context(Component) {
  class ComponentWithContext extends React.Component {
    render() {
      return (
        <Web3Context.Consumer>
          {(value) => <Component {...this.props} web3Provider={{ ...value }} />}
        </Web3Context.Consumer>
      );
    }
  }

  return ComponentWithContext;
}
