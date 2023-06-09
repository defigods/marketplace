import config, { camelCaseKeys } from '../lib/config'
import { getToken, saveUser } from '../lib/auth'
import axios from 'axios'

// TRANSFORMATIONS -> funzioni di trasformazione dati app -> server e server -> app.
// ----------------------------------------------------------------------------------------
export function example(user) {
  return {
    uuid: user.uuid,
    bleId: user.ble_id,
    bleName: user.ble_name,
    bleCode: user.ble_code,
    timestampCreation: user.timestamp_creation,
  }
}

// AUTHENTICATION REQUEST
// ----------------------------------------------------------------------------------------

/**
 * @function signIn
 * @param {*}
 */
export function signIn(publicAddress, singedNonce) {
  console.log('signIn')
  return request(
    { url: '/authentication/login', method: 'POST' },
    { public_address: publicAddress, signed_nonce: singedNonce },
    null
  )
}

/**
 * @function signInToken
 * @param {*}
 */
 export function signInToken(token) {
  console.log('signIn')
  return request(
    { url: '/authentication/login-token', method: 'POST' },
    { token: token },
    null
  )
}

export function getUserNonce(publicAddress) {
  return request(
    { url: '/user/nonce', method: 'GET' },
    { public_address: publicAddress },
    null
  )
}

export function userProfile(userToken) {
  saveUser('user', userToken)
  return request({ url: '/user/profile', method: 'GET' }, {}, null)
}

export function getUserBalanceAndAllowance() {
  return request(
    { url: '/user/balance_and_allowance', method: 'GET' },
    {},
    null
  )
}

export function postAcceptIBCOTerms() {
  return request({ url: '/user/ibco/accept_terms', method: 'POST' }, {}, null)
}

// USER REGISTRATION
// ----------------------------------------------------------------------------------------

/**
 * @function signUp
 * @param {*}
 */
export function signUp(userName, password, email) {
  return request(
    { url: '/user/registration', method: 'POST' },
    { username: userName, password: password, email: email },
    null
  )
}

export function signUpHybrid(email, userName, publicAddress) {
  return request(
    { url: '/user/registration', method: 'POST' },
    { email: email, username: userName, public_address: publicAddress },
    null
  )
}

export function signUpHybridSocial(token, provider, userName, publicAddress) {
  return request(
    { url: '/user/registration/social', method: 'POST' },
    {
      oauth: token,
      oauth_provider: provider,
      username: userName,
      public_address: publicAddress,
    },
    null
  )
}

export function signUpPublicAddress(publicAddress) {
  return request(
    { url: '/user/registration', method: 'POST' },
    { public_address: publicAddress },
    null
  )
}

export function signUpLoginMetamask(publicAddress) {
  return request(
    { url: '/authentication/metamask', method: 'POST' },
    {
      public_address: publicAddress,
      referred_by_user_uuid: getToken('referred_by_user'),
    },
    null
  )
}

export function setDbUserEmail(email = null) {
  return request(
    { url: '/user/set/email', method: 'POST' },
    {
      email: email,
    },
    null
  )
}

export function updateDbUserProfile(country = null) {
  return request(
    { url: '/user/update/profile', method: 'POST' },
    {
      country: country,
    },
    null
  )
}

export function confirmUserEmail(token = null) {
  return request(
    { url: '/user/confirm_email', method: 'POST' },
    {
      token: token,
    },
    null
  )
}

export function requestConfirmUserEmail(token = null) {
  return request({ url: '/user/request_confirm_email', method: 'GET' }, null)
}

// AUCTIONS
// ----------------------------------------------------------------------------------------
export function indexOpenAuctions(sort = null, page = 1) {
  return request(
    { url: '/auctions/open', method: 'GET' },
    { sort: sort, page: page },
    null
  )
}

export function indexMyOpenAuctions(sort = null, page = 1) {
  return request(
    { url: '/user/auctions', method: 'GET' },
    {
      sort: sort,
      page: page,
    },
    null
  )
}

export function getAuctionsTotals() {
  return request({ url: '/auctions/totals', method: 'GET' }, null)
}

export function getCounters() {
  return request({ url: '/lands/get_counters', method: 'GET' }, null)
}

export function auctionCreate(landUuid = null, worth = 10, gas = 10) {
  return request(
    { url: '/auction/start', method: 'POST' },
    {
      hex_id: landUuid,
      worth: worth,
      gas: gas,
    },
    null
  )
}

export function auctionBid(hexId = null, worth = 10, gas = 10) {
  return request(
    { url: '/auction/bid', method: 'POST' },
    {
      hex_id: hexId,
      worth: worth,
      gas: gas,
    },
    null
  )
}

export function getGasPrice() {
  return request({ url: '/auctions/lands_gas_cost', method: 'GET' }, {}, null)
}

export function participateMultipleAuctions(hexIds, singleMintWorth) {
  return request(
    { url: '/auctions/multi/participate', method: 'POST' },
    {
      hex_ids: hexIds,
      single_mint_worth: singleMintWorth,
    },
    null
  )
}

export function getCachedOpenLandsGeojson() {
  return request(
    { url: '/lands/geojson/cached/open/array', method: 'GET' },
    {},
    null
  )
}

// export function auctionBidPre(landUuid = null, worth = 10, txHash = null) {
// 	return request(
// 		{ url: '/auction/bid/pre', method: 'POST' },
// 		{
// 			hex_id: landUuid,
// 			worth: worth,
// 			tx_hash: txHash,
// 		},
// 		null,
// 	);
// }

// export function auctionBidConfirm(landUuid = null, worth = 10) {
// 	return request(
// 		{ url: '/auction/bid/confirm', method: 'POST' },
// 		{
// 			hex_id: landUuid,
// 			worth: worth,
// 		},
// 		null,
// 	);
// }

// export function auctionPreStart(landUuid = null, worth = 10, txHash = null) {
// 	return request(
// 		{ url: '/auction/start/pre', method: 'POST' },
// 		{
// 			hex_id: landUuid,
// 			worth: worth,
// 			tx_hash: txHash,
// 		},
// 		null,
// 	);
// }

// export function auctionConfirmStart(landUuid = null, txHash = null) {
// 	return request(
// 		{ url: '/auction/start/confirm', method: 'POST' },
// 		{
// 			hex_id: landUuid,
// 			tx_hash: txHash,
// 		},
// 		null,
// 	);
// }

// export function auctionCheckClose(landUuid = null) {
// 	return request(
// 		{ url: '/infura/auction/close', method: 'POST' },
// 		{
// 			hex_id: landUuid,
// 		},
// 		null,
// 	);
// }

// LANDS
export function getLand(hex_id = null) {
  return request(
    { url: '/land', method: 'GET' },
    {
      hex_id: hex_id,
    },
    null
  )
}

export function updateLandMarketStatusIfHasBeenMinted(hex_id = null) {
  return request(
    { url: '/land/update_market_status_if_has_been_minted', method: 'POST' },
    {
      hex_id: hex_id,
    },
    null
  )
}

export function getLands(hex_ids = null) {
  return request(
    { url: '/lands/list', method: 'GET' },
    {
      hex_ids: hex_ids,
    },
    null
  )
}

export function indexLands(sort = null, page = 1) {
  return request(
    { url: '/lands', method: 'GET' },
    {
      sort: sort,
      page: page,
    },
    null
  )
}

export function indexMyLands(sort = null, page = 1) {
  return request(
    { url: '/user/lands', method: 'GET' },
    {
      sort: sort,
      page: page,
    },
    null
  )
}

export function indexInterestingLands(hex_id) {
  return request(
    { url: '/lands/interesting/list', method: 'POST' },
    {
      hex_id: hex_id,
    },
    null
  )
}

export function checkLandOnMerkle(int_id) {
  return requestMerkleAPI(
    { url: '/merkle/token', method: 'GET' },
    {
      id: int_id,
    },
    null
  )
}

// SELL
export function sellLand(landUuid = null, worth = null) {
  return request(
    { url: '/order/sell', method: 'POST' },
    {
      hex_id: landUuid,
      worth: worth,
    },
    null
  )
}

export function deleteSellLand(landUuid = null) {
  return request(
    { url: '/order/delete/sell', method: 'POST' },
    {
      hex_id: landUuid,
    },
    null
  )
}

// BUY
export function buyLand(landUuid = null) {
  return request(
    { url: '/order/buy', method: 'POST' },
    {
      hex_id: landUuid,
    },
    null
  )
}

// BUY OFFER
export function buyOffer(landUuid = null, worth = null, expirationDate = null) {
  return request(
    { url: '/order/buy_offer', method: 'POST' },
    {
      hex_id: landUuid,
      worth: worth,
      expiration_date: expirationDate,
    },
    null
  )
}

export function deleteBuyOffer(orderUuid = null) {
  return request(
    { url: '/order/delete/buy_offer', method: 'POST' },
    {
      order_uuid: orderUuid,
    },
    null
  )
}

export function hitBuyOffer(orderUuid = null) {
  return request(
    { url: '/order/hit_buy_offer', method: 'POST' },
    {
      order_uuid: orderUuid,
    },
    null
  )
}

// NOTIFICATION

export function getUserNotifications(pageNumber = 1) {
  return request(
    { url: '/user/notifications', method: 'GET' },
    { page: pageNumber },
    null
  )
}

export function readNotification(notificationUuid = null) {
  return request(
    { url: '/notification/read', method: 'POST' },
    {
      notification_uuid: notificationUuid,
    },
    null
  )
}

export function readAllNotifications() {
  return request({ url: '/notifications/read', method: 'POST' }, {}, null)
}

export function hideNotification(notificationUuid = null) {
  return request(
    { url: '/notification/hide', method: 'POST' },
    {
      notification_uuid: notificationUuid,
    },
    null
  )
}

// Centralized helpers

export function sendPreAuctionStart(landId, bid, txHash) {
  // auctionPreStart(landId, bid, txHash)
  // 	.then((response) => {
  // 		// console.log('response', response.data);
  // 	})
  // 	.catch((error) => {
  // 		// Notify user if network error
  // 		// console.log(error);
  // 	});
}

export function sendConfirmAuctionStart(landId, txHash) {
  // auctionConfirmStart(landId, txHash)
  // 	.then((response) => {
  // 		if (response.data.result === true) {
  // 			// console.log('sendConfirmAuctionStart - response true', response.data);
  // 		} else {
  // 		  // console.log('responseFalse');
  // 			// console.log('sendConfirmAuctionStart - response false', response.data.errors[0].message);
  // 			// setActiveStep(0);
  // 		}
  // 	})
  // 	.catch((error) => {
  // 		// Notify user if network error
  // 		// console.log(error);
  // 	});
}

export function sendPreAuctionBid(landId, nextBid, txHash) {
  // auctionBidPre(landId, nextBid, txHash)
  // 	.then((response) => {
  // 	  // console.log(response)
  // 	})
  // 	.catch((error) => {
  // 		// Notify user if network error
  // 		// console.log(error);
  // 	});
}
export function sendAuctionBidConfirm(landId, nextBid) {
  // auctionBidConfirm(landId, nextBid)
  // 	.then((response) => {
  // 	  // console.log(response)
  // 	})
  // 	.catch((error) => {
  // 		// Notify user if network error
  // 		// console.log(error);
  // 	});
}

export function sendAuctionCheckClose(landId) {
  // 	auctionCheckClose(landId)
  // 		.then((response) => {
  // 			// console.log(response);
  // 		})
  // 		.catch((error) => {
  // 			// Notify user if network error
  // 			// console.log(error);
  // 		});
}

// Activities
export function userActivities() {
  return request({ url: '/user/activities', method: 'GET' }, {}, null)
}

// KYC - SUMSUB
export function getSumsubData() {
  return request({ url: '/user/sumsub/access_token', method: 'GET' }, {}, null)
}

export function setSumsubVerificationToStarted() {
  return request(
    { url: '/user/sumsub/set_verification/started', method: 'GET' },
    {},
    null
  )
}

export function getSumsubExternalLink(language = 'en') {
  return request(
    { url: '/user/sumsub/external_link', method: 'GET' },
    {
      language: language,
    },
    null
  )
}

// Cached infos

export function getCachedCirculatingSupply() {
  return request({ url: '/cached/circulating_supply', method: 'GET' }, {}, null)
}

// Download CSV Auctions
export function generateFileUserAuctionsCSV(key) {
  return request(
    { url: '/csv-report/generate-file-user-auctions', method: 'GET' },
    { unique_key: key }
  )
}

export function checkAuctionsFileCSV(key) {
  return request(
    { url: '/csv-report/check-file', method: 'GET' },
    { unique_key: key }
  )
}

export function getAuctionFileCSV(key) {
  return request(
    { url: '/csv-report/get-file', method: 'GET' },
    { unique_key: key }
  )
}

// GENERAL REQUEST
// ----------------------------------------------------------------------------------------

/**
 * @description This function helps the generation of an axios request with the api server.
 * @param {object} endpoint
 * @param {object} params
 * @param {string} token
 */
export function request(
  endpoint,
  params,
  req_config = { headers: { 'Content-Type': 'application/json' } }
) {
  const token = getToken('userToken')
  if (token) {
    axios.defaults.headers.common['Authorization'] = token // eslint-disable-line
  }
  if (req_config && req_config.headers) {
    req_config.headers['Content-Language'] = localStorage.getItem('i18nextLng')
  } else {
    req_config = {
      headers: { 'Content-Language': localStorage.getItem('i18nextLng') },
    }
  }

  return new Promise((resolve, reject) => {
    let req
    if (endpoint.method === 'POST') {
      req = axios.post(
        `${config.apis.hostname}${endpoint.url}`,
        params,
        req_config
      )
    } else {
      req = axios.get(`${config.apis.hostname}${endpoint.url}`, { params })
    }
    req
      .then((response) => {
        resolve(camelCaseKeys(response))
      })
      .catch((err) => {
        reject(err)
        console.log('error', err)
      })
  })
}

export function requestMerkleAPI(
  endpoint,
  params,
  req_config = { headers: { 'Content-Type': 'application/json' } }
) {
  const token = getToken('userToken')
  if (token) {
    axios.defaults.headers.common['x-api-key'] = config.apis.merkleApiKey // eslint-disable-line
  }
  axios.defaults.headers.common['Authorization'] = token
  if (req_config && req_config.headers) {
    req_config.headers['Content-Language'] = localStorage.getItem('i18nextLng')
  } else {
    req_config = {
      headers: { 'Content-Language': localStorage.getItem('i18nextLng') },
    }
  }

  return new Promise((resolve, reject) => {
    let req
    if (endpoint.method === 'POST') {
      req = axios.post(
        `${config.apis.merkleHostname}${endpoint.url}`,
        params,
        req_config
      )
    } else {
      req = axios.get(`${config.apis.merkleHostname}${endpoint.url}`, {
        params,
      })
    }
    req
      .then((response) => {
        resolve(camelCaseKeys(response))
      })
      .catch((err) => {
        reject(err)
        console.log('error', err)
      })
  })
}
