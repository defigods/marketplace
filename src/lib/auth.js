import Cookies from 'js-cookie';
import config from './config';

export function saveToken(tokenName = 'token', tokenValue) {
	Cookies.set(tokenName, tokenValue); //, { domain: config.apis.cookieDomain }
}

export function getToken(tokenName = 'token') {
	return Cookies.get(tokenName);
}

export function removeToken(tokenName = 'token') {
	Cookies.remove(tokenName);
	Cookies.remove(tokenName, { domain: config.apis.cookieDomain });
}

export function checkToken(tokenName = 'token') {
	return Cookies.get(tokenName) !== undefined;
}

export function saveUser(cookieName = 'user', cookieValue) {
	Cookies.set(cookieName, cookieValue, { domain: config.apis.cookieDomain });
}

export function getUser(cookieName = 'userToken') {
	return Cookies.get(cookieName);
}

export function removeUser(cookieName = 'userToken') {
	Cookies.remove(cookieName);
	Cookies.remove(cookieName, { domain: config.apis.cookieDomain });
}

export function isLogged() {
	return getUser() !== undefined;
}
