import React, { createContext, Component } from 'react';
import Web3 from 'web3';
import { removeToken, saveToken, isLogged, getToken, removeUser } from '../lib/auth';
import { successNotification, networkError, dangerNotification, warningNotification } from '../lib/notifications';
import { userProfile, getUserNonce, signUpPublicAddress, signIn, sendPreAuctionStart, sendConfirmAuctionStart, sendAuctionBidConfirm, sendPreAuctionBid, signUpLoginMetamask } from '../lib/api';
import {promisify} from '../lib/config';
import config from '../lib/config';
import { promisifyAll } from 'bluebird';
import {
  tokenBuyAddress,
  daiAddress,
  tetherAddress,
  usdcAddress,
  ovrAddress,
  icoAddress,
  ovr721Address,
  icoParticipateAddress,
} from '../lib/contracts';
import { tokenBuyAbi, erc20Abi, icoAbi, ovr721Abi, icoParticipateAbi, } from '../lib/abis';
import { UserContext } from './UserContext';
import { useHistory } from 'react-router-dom';



export const Web3Context = createContext();

export class Web3Provider extends Component {
  static contextType = UserContext;
  constructor(props) {
    super(props);
    this.state = {
      ovrsOwned: 0,
      dai: null,
      tether: null,
      usdc: null,
      tokenBuy: null,
      ovr: null,
      ico: null,
      ovr721: null,
      setupComplete: false,
      perEth: 0,
      perUsd: 0,
      lastTransaction: "0x0"
    };
  }

  componentDidMount() {
    if (isLogged()) {
      this.lightSetupWeb3();
    }
  }

  waitTx = (txHash) => {
    return new Promise((resolve, reject) => {
      let blockCounter = 60; // If it's not confirmed after 30 blocks, move on
      // Wait for tx to be finished
      // console.log('watching txHash', txHash);
      let filter = window.web3.eth.filter('latest').watch(async (err, blockHash) => {
        if (err) {
          filter.stopWatching();
          filter = null;
          return reject(err);
        }
        if (blockCounter <= 0) {
          filter.stopWatching();
          filter = null;
          console.warn('!! Tx expired !!');
          reject(`Transaction not confirmed after ${blockCounter} blocks`);
        }
        // Get info about latest Ethereum block
        const block = await promisify((cb) => window.web3.eth.getBlock(blockHash, cb));
        --blockCounter;
        // Found tx hash?
        if (block.transactions.indexOf(txHash) > -1) {
          // Tx is finished
          // console.log('Tx has completed')
          filter.stopWatching();
          filter = null;
          return resolve();
          // Tx hash not found yet?
        }
      });
    });
  };

  waitTxWithCallback = (txHash, callBackSuccess) => {
    return new Promise((resolve, reject) => {
      let blockCounter = 60; // If it's not confirmed after 30 blocks, move on
      // Wait for tx to be finished
      // console.log('watching txHash', txHash);
      let filter = window.web3.eth.filter('latest').watch(async (err, blockHash) => {
        if (err) {
          filter.stopWatching();
          filter = null;
          return reject(err);
        }
        if (blockCounter <= 0) {
          this.updateBalance();
          filter.stopWatching();
          filter = null;
          console.warn('!! Tx expired !!');
          reject(`Transaction not confirmed after ${blockCounter} blocks`);
        }
        // Get info about latest Ethereum block
        const block = await promisify((cb) => window.web3.eth.getBlock(blockHash, cb));
        --blockCounter;
        // Found tx hash?
        if (block.transactions.indexOf(txHash) > -1) {
          // Tx is finished
          this.updateBalance();
          // console.log('Tx has completed')
          filter.stopWatching();
          filter = null;
          callBackSuccess();
          return resolve();
          // Tx hash not found yet?
        }
      });
    });
  };

  // Note: the web3 version is always 0.20.7 because of metamask
  setupWeb3 = async (callback) => {
    // console.log('render setupweb3');
		const ethereum = window.ethereum;
		let web3NetworkVersion = parseInt(ethereum.chainId, 16) === config.web3network;
		if( web3NetworkVersion === false ) {
			callback(false);
			return false;
		}
    if (typeof ethereum !== 'undefined') {
      try {
        await ethereum.enable();
      } catch (e) {
        return warningNotification(this.props.t('Warning.metamask.permission.title'), this.props.t('Warning.metamask.permission.desc'));
      }
      window.web3 = new Web3(ethereum);
    } else if (typeof window.web3 !== 'undefined') {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
			callback(false)
			warningNotification(this.props.t('Warning.metamask.not.detected.title'), this.props.t('Warning.metamask.not.detected.desc'));
			return false;
    }
    window.web3.eth.defaultAccount = window.web3.eth.accounts[0];
		console.log("window.web3.eth.defaultAccount", window.web3.eth.defaultAccount)
    // Sign nonce for centralized login
    let publicAddress = window.web3.eth.defaultAccount.toLowerCase();
    await this.handleCentralizedLogin(publicAddress, callback);

    // Helpers
    await this.refreshWhenAccountsChanged();
    await this.updateBalance();

    await this.setupContracts();
    await this.getOvrsOwned();
  };

  // if the user is logged in with a valid token just reload datas
  lightSetupWeb3 = async () => {
    const ethereum = window.ethereum;
    await ethereum.enable();
    window.web3.eth.defaultAccount = window.web3.eth.accounts[0];
    await this.refreshWhenAccountsChanged();
    await this.updateBalance();
    await this.setupContracts();
    await this.getOvrsOwned();
  };

  setupContracts = async () => {
    const _dai = window.web3.eth.contract(erc20Abi).at(daiAddress);
    const _tether = window.web3.eth.contract(erc20Abi).at(tetherAddress);
    const _usdc = window.web3.eth.contract(erc20Abi).at(usdcAddress);
    const _tokenBuy = window.web3.eth.contract(tokenBuyAbi).at(tokenBuyAddress);
    const _ovr = window.web3.eth.contract(erc20Abi).at(ovrAddress);
    const _ico = window.web3.eth.contract(icoAbi).at(icoAddress);
    const _ovr721 = window.web3.eth.contract(ovr721Abi).at(ovr721Address);
    const _icoParticipate = window.web3.eth.contract(icoParticipateAbi).at(icoParticipateAddress);

    this.setState({
      dai: promisifyAll(_dai),
      tether: promisifyAll(_tether),
      usdc: promisifyAll(_usdc),
      tokenBuy: promisifyAll(_tokenBuy),
      ovr: promisifyAll(_ovr),
      ico: promisifyAll(_ico),
      ovr721: promisifyAll(_ovr721),
      icoParticipate: promisifyAll(_icoParticipate),
      setupComplete: true,
    }, this.updateBalanceInterval);

    await this.getPrices()
  };

  // Refreshes the page when the metamask account is changed
  refreshWhenAccountsChanged = () => {
		window.ethereum.on('networkChanged', function (networkId) {
			let web3NetworkVersion = parseInt(window.ethereum.chainId, 16) === config.web3network;
			if( web3NetworkVersion === false ) {
				if (this.context.state.isLoggedIn) {
						this.context.actions.logoutUser();
						this.setupWeb3();
				} else {
						this.context.actions.logoutUser();
				}
			}
		})

    window.ethereum.on('accountsChanged', (accounts) => {
      if (this.context.state.isLoggedIn) {
        this.context.actions.logoutUser();
        this.setupWeb3();
      } else {
        this.context.actions.logoutUser();
      }
    });
  };

  updateBalance = async () => {
    this.getOvrsOwned()
  };

  // Checks every half a second if the balance has changed and updates it
  updateBalanceInterval = async () => {
    setInterval(this.getOvrsOwned, 5e2)
  }

  getOvrsOwned = async () => {
    if (this.state.ovr && this.state.setupComplete && window.web3.eth.defaultAccount) {
      const ovrsOwned = String(
        window.web3.fromWei(await this.state.ovr.balanceOfAsync(window.web3.eth.defaultAccount)),
      );
      this.setState({ ovrsOwned });
    }
  };

  //
  // Centralized authentication with Metamask
  //

  handleCentralizedLogin(publicAddress, callback) {
		signUpLoginMetamask(publicAddress).then((response) => {
			getUserNonce(publicAddress).then((response) => {
					if (response.data.result === true) {
							let nonce = response.data.user.nonce;
							this.handleUserSignMessage(publicAddress, nonce, callback);
					} else {
							dangerNotification(this.props.t('Danger.unable.login.title'), response.data.errors);
					}
			});
		});
  }

  handleUserSignMessage = (publicAddress, nonce, callback) => {
    return new Promise((resolve, reject) =>
      window.web3.personal.sign(
        window.web3.fromUtf8(`I am signing my one-time nonce: ${nonce}`),
        publicAddress,
        (err, signature) => {
          if (err) return reject(err);
          this.handleAuthenticate(publicAddress, signature, callback);
        },
      ),
    );
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

  // Web3 Lands

  redeemLands = async () => {

    const activeLandsIds = await this.state.ico.getActiveLandsAsync();
    let landsRedeemed = 0;
    for (let i = 0; i < activeLandsIds.length; i++) {
      const land = await this.state.ico.landsAsync(activeLandsIds[i]);
      const auctionTime = await this.state.ico.auctionLandDurationAsync();
      const now = Math.trunc(Date.now() / 1000);
      const timePassedInSeconds = now - land[3];
      const landState = parseInt(land[4]);

      // If this is your land and it hasn't been redeemed already and the auction is done
      if (landState !== 2 && land[0] === window.web3.eth.defaultAccount && timePassedInSeconds >= auctionTime) {
        try {
          await this.state.ico.redeemWonLandAsync(activeLandsIds[i], {
            gasPrice: window.web3.toWei(300, 'gwei'),
          });
          landsRedeemed++;
        } catch (e) {
          return dangerNotification(this.props.t('Danger.error.redeem.land.title',{land:activeLandsIds[i]}) , e.message);
        }
      }
    }
    if (landsRedeemed === 0) {
      warningNotification(this.props.t('Warning.no.lands.title'),this.props.t('Warning.no.lands.desc'));
    } else {
      successNotification(this.props.t('Success.receive.lands.title'),this.props.t('Success.receive.lands.desc'));
    }
  };

  redeemSingleLand = async (hexId) => {
	const landId = parseInt(hexId, 16);
	
    try {
      const tx = await this.state.ico.redeemWonLandAsync(landId, {
        gasPrice: window.web3.toWei(300, 'gwei'),
      });
      await this.waitTx(tx);
    } catch (e) {
      return dangerNotification(this.props.t('Danger.error.redeem.land.title',{land:landId}) , e.message);
    }
  };

  // Returns true for a successful approval or false otherwise
  approveErc721Token = async (hexId, isLandId) => {
	let landId = parseInt(hexId, 16);
	
    if (isLandId) {
      landId = hexId;
    }
    const existingApproval = await this.state.ovr721.getApprovedAsync(landId);
    if (existingApproval === icoAddress) return true;
    try {
      const tx = await this.state.ovr721.approveAsync(icoAddress, landId, {
        gasPrice: window.web3.toWei(300, 'gwei'),
      });
      await this.waitTx(tx);
    } catch (e) {
      dangerNotification(this.props.t('Danger.error.approving.title'), e.message);
      return false;
    }
    return true;
  };

  approveOvrTokens = async (toIcoParticipate, token) => {
    let currentBalance = await token.balanceOfAsync(window.web3.eth.defaultAccount);
    let currentAllowance = await token.allowanceAsync(window.web3.eth.defaultAccount, toIcoParticipate ? icoParticipateAddress : icoAddress);
    // Allow all the tokens
    if (currentBalance.greaterThan(currentAllowance)) {
      try {
        const tx = await token.approveAsync(toIcoParticipate ? icoParticipateAddress : icoAddress, currentBalance, {
          gasPrice: window.web3.toWei(300, 'gwei'),
        });
        await this.waitTx(tx);
      } catch (e) {
        dangerNotification(this.props.t('Danger.approval.error.title'),this.props.t('Danger.approval.error.desc'));
        return false;
      }
    }
    return true;
  };

  buyLand = async (hexId) => {
    const landId = parseInt(hexId, 16);
    const tx = await this.state.ico.buyLandAsync(landId, {
      gasPrice: window.web3.toWei(300, 'gwei'),
    });
    await this.waitTx(tx);
  };

  // To put a land on sale or remove it. Will approve the ERC721 first.
  // The price can be 0 to give it away for free
  putLandOnSale = async (hexId, price, onSale) => {
	const landId = parseInt(hexId, 16);
	
    try {
      const tx = await this.state.ico.putLandOnSaleAsync(landId, price, onSale, {
        gasPrice: window.web3.toWei(300, 'gwei'),
      });
      await this.waitTx(tx);
    } catch (e) {
      return dangerNotification(this.props.t('Danger.error.listing.title'), e.message);
    }
    successNotification(this.props.t('Success.listing.lands.title'), this.props.t('Success.listing.lands.desc'));
  };

  setAllNotificationsAsReaded = () => {
    let notifications_content = this.state.user.notifications.content;
    notifications_content.readAllNotifications();
    this.setState({
      user: {
        ...this.state.user,
        notifications: {
          ...this.state.user.notifications,
          unreadedCount: 0,
          content: notifications_content,
        },
      },
    });
  };

  getOffersToBuyLand = async (hexId) => {
    const landId = parseInt(hexId, 16);
    const landOfferIds = await this.state.ico.getLandOffersAsync(landId);
    let offers = [];
    const latestGroupCounter = String(await this.state.ico.groupCountersAsync(landId));
    for (let i = 0; i < landOfferIds.length; i++) {
      const landOfferId = landOfferIds[i];
      const offer = await this.state.ico.landOffersAsync(String(landOfferId));
      // If this offer is not for the most recent group, skip it
      if (parseInt(offer[2]) != latestGroupCounter) continue;
      offers.push(offer);
    }
    offers = offers.map((offer) => ({
      id: String(offer[0]),
      by: offer[1],
      group: parseInt(offer[2]),
      landId: String(offer[3]),
      price: String(window.web3.fromWei(offer[4])),
      timestamp: String(offer[5]),
      expirationDate: String(offer[6]),
      state: String(offer[7]),
    }));
    return offers;
  };

  cancelBuyOffer = async (offerId) => {
    return this.state.ico.cancelBuyOfferAsync(offerId, {
      gasPrice: window.web3.toWei(300, 'gwei'),
    });
  };

  declineBuyOffer = async (offerId) => {
    return this.state.ico.respondToBuyOfferAsync(offerId, false, {
      gasPrice: window.web3.toWei(300, 'gwei'),
    });
  };

  acceptBuyOffer = async (offerId) => {
    return this.state.ico.respondToBuyOfferAsync(offerId, true, {
      gasPrice: window.web3.toWei(300, 'gwei'),
    });
  };

	/**
	 * Sets the number of tokens you get per ether and the number of tokens for stablecoins
	 */
  getPrices = () => {
    return new Promise(async resolve => {
      const perEth = Number(await this.state.tokenBuy.ethPriceAsync());
      let perUsd = Number(await this.state.tokenBuy.tokensPerUsdAsync());
      this.setState({
        perEth,
        perUsd,
      }, resolve);
    })
  };

	/**
	 * To buy OVR ERC20 tokens from the TokenBuy contract.
	 * When buying with stablecoins, you must first approve them which is done here automatically that's why you can expect to receive 2 transaction notifications from metamask
	 * @param {String} type The type of payment chosen
	 */
  buy = async (tokensToBuy, type) => {

    let user = this.context.state.user;
    if (config.environment != 'DEVELOPMENT' && user.kycReviewAnswer < 1) { return dangerNotification('Identity verification required', 'To buy OVR token it is required that you pass our KYC. Go to your Profile and Start now the Identity Verification.');}
    if (tokensToBuy <= 0) return warningNotification(this.props.t('Warning.setup.error.title'), this.props.t('Warning.setup.error.desc'));
    tokensToBuy = window.web3.toBigNumber(window.web3.toWei(String(tokensToBuy)))

    await this.getPrices()
    try {
      switch (type) {
        case 'eth':
          const ovrsPerEth = this.state.perEth * this.state.perUsd;
          const value = String(Math.ceil(tokensToBuy.div(ovrsPerEth)) + 1e6);
          const tx = await this.state.tokenBuy.buyTokensWithEthAsync(tokensToBuy, {
            value,
            gasPrice: window.web3.toWei(300, 'gwei'),
          });
          await this.waitTx(tx);
          break;
        case 'usdt':
          await this.buyWithToken(tokensToBuy, this.state.tether, 'usdt');
          break;
        case 'usdc':
          await this.buyWithToken(tokensToBuy, this.state.usdc, 'usdc');
          break;
        case 'dai':
          await this.buyWithToken(tokensToBuy, this.state.dai, 'dai');
          break;
        default:
          warningNotification(this.props.t('Warning.currency.error.title'), this.props.t('Warning.currency.error.desc'));
          break;
      }
      this.getOvrsOwned();
    } catch (e) {
      // console.log('Error', e);
      warningNotification(
        this.props.t('Warning.buying.error.title'), this.props.t('Warning.buying.error.desc')
      );
    }
  };

  buyWithToken = async (tokensToBuy, token, type) => {

    let currentBalance = await token.balanceOfAsync(window.web3.eth.defaultAccount);
    let currentAllowance = await token.allowanceAsync(window.web3.eth.defaultAccount, tokenBuyAddress);
    // Allow all the tokens
    if (currentBalance.greaterThan(currentAllowance)) {
      try {
        const response = await token.approveAsync(tokenBuyAddress, currentBalance);
        await this.waitTx(response);
      } catch (e) {
        return warningNotification(this.props.t('Warning.approving.error.title'), this.props.t('Warning.approving.error.desc'));
      }
    }
    // Check if the user has enough balance to buy those tokens
    if (currentBalance.lessThan(tokensToBuy)) {
      return warningNotification(
		this.props.t('Not enough tokens'),
		this.props.t('Warning.no.tokens.desc', {message: window.web3.fromWei(tokensToBuy)})
        //`You don't have enough to buy ${window.web3.fromWei(tokensToBuy)} OVR tokens`,
      );
    }
    try {
      let tx;
      switch (type) {
        case 'dai':
          tx = await this.state.tokenBuy.buyTokensWithDaiAsync(tokensToBuy, {
            gasPrice: window.web3.toWei(300, 'gwei'),
          });
          break;
        case 'usdt':
          tx = await this.state.tokenBuy.buyTokensWithUsdtAsync(tokensToBuy, {
            gasPrice: window.web3.toWei(300, 'gwei'),
          });
          break;
        case 'usdc':
          tx = await this.state.tokenBuy.buyTokensWithUsdcAsync(tokensToBuy, {
            gasPrice: window.web3.toWei(300, 'gwei'),
          });
          break;
        default:
          warningNotification(this.props.t('Warning.currency.error.title'), this.props.t('Warning.currency.error.desc'));
          break;
      }
      await this.waitTxWithCallback(tx, () => {
        successNotification(this.props.t('Success.receive.ovr.title'), this.props.t('Success.receive.ovr.desc'));
      });
    } catch (e) {
      return warningNotification(this.props.t('Warning.buy.error.title'), this.props.t('Warning.buy.error.desc.token'));
    }
  };

  // Type is a number where
	// 0 -> eth
  // 1 -> Dai
  // 2 -> Usdt
	// 3 -> Usdc
	// 4 -> OVR
	participate = async (type, bid, landId) => {
		let tx

		try {
      await this.getPrices()
		} catch (e) {
			return warningNotification(this.props.t('Warning.get.prices.title'), this.props.t('Warning.get.prices.desc')+` ${e.message}`)
    }
    bid = window.web3.toBigNumber(String(bid))

		try {
      // For ether we send the value instead of the bid
      let gasPrice = window.web3.toWei('30', 'gwei');
			if (type === 0) {
        const ovrsPerEth = this.state.perEth * (this.state.perUsd / 2);
        const value = String(Math.ceil(bid.div(ovrsPerEth)) + 1e6);
				tx = this.state.icoParticipate.participateAsync(type, bid, landId, {
					value: value,
          gasPrice: gasPrice,
        })
			} else {
        tx = this.state.icoParticipate.participateAsync(type, bid, landId, {
          gasPrice: gasPrice,
        })
      }
			return tx
		} catch (e) {
			return warningNotification(this.props.t('Warning.buy.error.title'), this.props.t('Warning.buy.error.desc')+ ` ${e.message}`);
		}
  };
  
  participateMint = async (type, bid, landId) => {
    let bidInWei = window.web3.toWei(bid)
    let landIdBase16 = parseInt(landId, 16);
    let tx = await this.participate(type, bidInWei, landIdBase16);
    this.setState({lastTransaction: tx});
    sendPreAuctionStart(landId, bid, tx);
    this.waitTxWithCallback(tx, () => {
      sendConfirmAuctionStart(landId, tx)
    })
  }

  participateBid = async (type, bid, landId) => {
    let bidInWei = window.web3.toWei(bid)
    let landIdBase16 = parseInt(landId, 16);
    let tx = await this.participate(type, bidInWei, landIdBase16);
    this.setState({lastTransaction: tx});
    sendPreAuctionBid(landId, bid, tx);
    this.waitTxWithCallback(tx, () => {
      sendAuctionBidConfirm(landId, bid)
    })
  }

  participateBuyOffer = async (type, proposedValue, expirationDate, landId) => {
    // TODO all the centralized part 
    // TODO double check behavior with different contract
    let bidInWei = window.web3.toWei(proposedValue)
    let landIdBase16 = parseInt(landId, 16);
    // console.log('bidInWei', bidInWei)
    // console.log('landIdBase16', landIdBase16)
    // console.log('expirationDate', expirationDate)
    const tx = await this.state.ico.offerToBuyLandAsync(landIdBase16, bidInWei, expirationDate, {
      gasPrice: window.web3.toWei(300, 'gwei'),
    });
    await this.waitTx(tx);
  }



  render() {
    return (
      <Web3Context.Provider
        value={{
          state: this.state,
          actions: {
            getOvrsOwned: this.getOvrsOwned,
            waitTx: this.waitTx,
            waitTxWithCallback: this.waitTxWithCallback,
						setupWeb3: this.setupWeb3,
            redeemLands: this.redeemLands,
            putLandOnSale: this.putLandOnSale,
            approveErc721Token: this.approveErc721Token,
            approveOvrTokens: this.approveOvrTokens,
            buyLand: this.buyLand,
            getOffersToBuyLand: this.getOffersToBuyLand,
            cancelBuyOffer: this.cancelBuyOffer,
            declineBuyOffer: this.declineBuyOffer,
            acceptBuyOffer: this.acceptBuyOffer,
            redeemSingleLand: this.redeemSingleLand,
            buyWithToken: this.buyWithToken,
            buy: this.buy,
            getPrices: this.getPrices,
            participate: this.participate,
            participateMint: this.participateMint,
            participateBid: this.participateBid,
            participateBuyOffer: this.participateBuyOffer
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
