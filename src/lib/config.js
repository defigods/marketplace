import _ from 'lodash';

//
// General Configs
//

// Possible values are STAGING, DEVELOPMENT, PRODUCTION
const environment = 'STAGING';

let apis;

if (environment === 'PRODUCTION') {
	apis = {
		hostname: 'https://mws.ovr.ai/api/v1',
		socket: 'wss://mws.ovr.ai/cable',
		indacoinHelperApi: 'https://web3-helper.ovr.ai/indacoin',
		etherscan: 'https://etherscan.io/',
		cookieDomain: 'ovr.ai',
		sumsubApi: 'https://api.sumsub.com',
		OVRContract: '0x128989bd5bac572d8f60c89d6eaa8f6d35f5c25c',
		walletApproved: '0xda0b2EC0E8eE995e3257Bf99EA678e26651DbeEc',
	};
} else if (environment === 'STAGING') {
	apis = {
		hostname: 'https://mws-staging.ovr.ai/api/v1',
		socket: 'wss://mws-staging.ovr.ai/cable',
		indacoinHelperApi: 'https://web3-helper-staging.ovr.ai/indacoin',
		etherscan: 'https://ropsten.etherscan.io/',
		cookieDomain: 'ovr.ai',
		sumsubApi: 'https://test-api.sumsub.com',
		OVRContract: '0x128989bd5bac572d8f60c89d6eaa8f6d35f5c25c',
		walletApproved: '0xda0b2EC0E8eE995e3257Bf99EA678e26651DbeEc',
	};
} else {
	apis = {
		hostname: 'http://localhost:3000/api/v1',
		socket: 'ws://localhost:3000/cable',
		indacoinHelperApi: 'https://web3-helper-staging.ovr.ai/indacoin',
		etherscan: 'https://ropsten.etherscan.io/',
		cookieDomain: 'localhost',
		sumsubApi: 'https://test-api.sumsub.com',
		OVRContract: '0x128989bd5bac572d8f60c89d6eaa8f6d35f5c25c',
		walletApproved: '0xda0b2EC0E8eE995e3257Bf99EA678e26651DbeEc',
	};
}

const map = {
	lat: 46.0922495,
	lng: 13.2312417,
	zoom: 0,
	fillOpacity: 0.3,
	colorScale: ['#5F39BE', '#ffffff', '#1a0731', '#EC663C', '#0081DD'],
};

let config = {
	web3network: environment === 'PRODUCTION' ? 1 : 3,
	environment: environment,
	apis: apis,
	map: map,
};

export default config;

//
//  Lib Functions
//

export function camelCaseKeys(object) {
	let camelCaseObject = _.cloneDeep(object);

	if (_.isArray(camelCaseObject)) {
		return _.map(camelCaseObject, camelCaseKeys);
	}
	if (_.isString(camelCaseObject)) {
		return camelCaseObject;
	}
	camelCaseObject = _.mapKeys(camelCaseObject, (value, key) => _.camelCase(key));

	// Recursively apply throughout object
	return _.mapValues(camelCaseObject, (value) => {
		if (_.isPlainObject(value)) {
			return camelCaseKeys(value);
		} else if (_.isArray(value)) {
			return _.map(value, camelCaseKeys);
		}
		return value;
	});
}

Array.prototype.readNotification = function (notification_uuid) {
	let foundItem = this.find((item) => item.uuid === notification_uuid);
	if (foundItem) {
		foundItem.status = 1;
	}
};

Array.prototype.readAllNotifications = function () {
	this.forEach((item) => {
		item.status = 1;
	});
};

export const promisify = (inner) =>
	new Promise((resolve, reject) =>
		inner((err, res) => {
			if (err) {
				reject(err);
			} else {
				resolve(res);
			}
		}),
	);


export function isiOS() {
	return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
} 

export function isImToken(){
	return !!window.imToken
}