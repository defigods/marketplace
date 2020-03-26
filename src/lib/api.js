import config, {camelCaseKeys} from '../lib/config'
import { getToken, saveUser} from '../lib/auth'
import axios from 'axios'


// TRANSFORMATIONS -> funzioni di trasformazione dati app -> server e server -> app.
// ----------------------------------------------------------------------------------------
export function example(user) {
  return {
    uuid: user.uuid,
    bleId: user.ble_id,
    bleName: user.ble_name,
    bleCode: user.ble_code,
    timestampCreation: user.timestamp_creation
  }
}

// AUTHENTICATION REQUEST
// ----------------------------------------------------------------------------------------

/**
 * @function signIn
 * @param {*}
 */
export function signIn(userName, password) {
  return request({ url: '/authentication/login', method: 'POST'}, { username: userName, password: password }, null)
}

export function userProfile(userToken) {
  saveUser('user',userToken)
  return request({ url: '/user/profile', method: 'GET' }, {}, null)
}

// USER REGISTRATION
// ----------------------------------------------------------------------------------------

/**
 * @function signUp
 * @param {*}
 */
export function signUp(userName, password, email) {
  return request({ url: '/user/registration', method: 'POST' }, { username: userName, password: password, email: email }, null)
}


// AUCTIONS
// ----------------------------------------------------------------------------------------
export function indexOpenAuctions(sort = null, page = 1) {
  return request({ url: '/auctions/open', method: 'GET' }, { sort: sort, page: page
   }, null)
}

export function indexMyOpenAuctions(sort = null, page = 1) {
  return request({ url: '/user/auctions', method: 'GET' }, {
    sort: sort, page: page
  }, null)
}

export function bidAuction(landUuid = null, worth = 10) {
  return request({ url: '/auction/bid', method: 'POST' }, {
    land_uuid: landUuid, worth: worth
  }, null)
}

export function mintLand(landUuid = null, worth = 10) {
  return request({ url: '/land/mint', method: 'POST' }, {
    land_uuid: landUuid, worth: worth
  }, null)
}


// LANDS
export function getLand(hex_id = null) {
  return request({ url: '/land', method: 'GET' }, {
    hex_id: hex_id
  }, null)
}

export function indexLands(sort = null, page = 1) {
  return request({ url: '/lands', method: 'GET' }, {
    sort: sort, page: page
  }, null)
}

export function indexMyLands(sort = null, page = 1) {
  return request({ url: '/user/lands', method: 'GET' }, {
    sort: sort, page: page
  }, null)
}


// SELL 
export function sellLand(landUuid = null, worth = null) {
  return request({ url: '/land/sell', method: 'POST' }, {
    land_uuid: landUuid, worth: worth
  }, null)
}

export function deleteSellLand(landUuid = null) {
  return request({ url: '/land/delete_sell', method: 'POST'}, {
    land_uuid: landUuid
  }, null)
}

// GENERAL REQUEST
// ----------------------------------------------------------------------------------------

/**
 * @description This function helps the generation of an axios request with the api server.
 * @param {object} endpoint
 * @param {object} params
 * @param {string} token
 */
export function request(endpoint, params, req_config = { headers: { 'Content-Type': 'application/json' } }) {
  const token = getToken('userToken')
  if (token) {
    axios.defaults.headers.common['Authorization'] = token // eslint-disable-line
  }

  return new Promise((resolve, reject) => {
    let req
    if (endpoint.method === 'POST') {
      req = axios.post(`${config.apis.hostname}${endpoint.url}`, params, req_config)
    } else {
      req = axios.get(`${config.apis.hostname}${endpoint.url}`, { params })
    }
    req.then((response) => {
      resolve(camelCaseKeys(response))
    }).catch((err) => {reject(err); console.log(err)})
  })
}


