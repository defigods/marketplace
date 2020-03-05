import config, {camelCaseKeys} from '../lib/config'
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

// USER REGISTRATION
// ----------------------------------------------------------------------------------------

/**
 * @function signIn
 * @param {*}
 */
export function signUp(userName, password, email) {
  return request({ url: '/user/registration', method: 'POST' }, { username: userName, password: password, email: email }, null)
}



// GENERAL REQUEST
// ----------------------------------------------------------------------------------------

/**
 * @description This function helps the generation of an axios request with the api server.
 * @param {object} endpoint
 * @param {object} params
 * @param {string} token
 */
export function request(endpoint, params , req_config = { headers: { 'Content-Type': 'application/json' } }) {
  // const token = getToken('userToken')
  // if (token) {
  //   axios.defaults.headers.common['Authorization'] = token // eslint-disable-line
  // }
  console.log("params", params)
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


