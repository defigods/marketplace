import Cookies from 'js-cookie'


export function saveToken(tokenName = 'token', tokenValue) {
  Cookies.set(tokenName, tokenValue)
}

export function getToken(tokenName = 'token') {
  return Cookies.get(tokenName)
}

export function removeToken(tokenName = 'token') {
  Cookies.remove(tokenName)
}

export function checkToken(tokenName = 'token') {
  return Cookies.get(tokenName) !== undefined
}

export function saveUser(cookieName = 'user', cookieValue) {
  Cookies.set(cookieName, cookieValue)
}

export function getUser(cookieName = 'userToken') {
  return Cookies.get(cookieName)
}


export function removeUser(cookieName = 'userToken') {
  Cookies.remove(cookieName)
}

export function isLogged() {
  return getUser() !== undefined
}
