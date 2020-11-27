import _ from 'lodash';

//
// General Configs
//

// Possible values are STAGING, DEVELOPMENT, PRODUCTION
const environment = 'DEVELOPMENT';

let apis;

if (environment === 'PRODUCTION') {
	apis = {
		hostname: 'https://mws.ovr.ai/api/v1',
		socket: 'wss://mws.ovr.ai/cable',
		indacoinHelperApi: 'https://web3-helper.ovr.ai/indacoin',
		etherscan: 'https://etherscan.io/',
		cookieDomain: 'ovr.ai',
		sumsubApi: 'https://api.sumsub.com',
		OVRContract: '0x4CbE615C151aeb453aab0516Ad7207C641Fe70dC',
		walletApproved: '0xda0b2EC0E8eE995e3257Bf99EA678e26651DbeEc',
		// IBCO 
		controllerAddress: "0xA421f87AaBdc0E071161b78A9a750fC2940B4E97",
		curveAddress: "0x27769D53C65491eeD8e0460e871B2F4cfB6a37E7",
		DAI: "0x349205F7378Bef80a70D65e465dAa45451DCbfb4",
		RewardToken: "0x5d0ebAB6136a8794DC302dEF53267bFB92D9315f",
		BancorFormula: "0x414f25B3A1Fc2c5f9D5642D2Ef72162d1C1DDbE2",
		connectorWeight: "20000",

	};
} else if (environment === 'STAGING') {
	apis = {
		hostname: 'https://mws-staging.ovr.ai/api/v1',
		socket: 'wss://mws-staging.ovr.ai/cable',
		indacoinHelperApi: 'https://web3-helper-staging.ovr.ai/indacoin',
		etherscan: 'https://rinkeby.etherscan.io/',
		cookieDomain: 'ovr.ai',
		sumsubApi: 'https://test-api.sumsub.com',
		OVRContract: '0x4CbE615C151aeb453aab0516Ad7207C641Fe70dC',
		walletApproved: '0xda0b2EC0E8eE995e3257Bf99EA678e26651DbeEc',
		// IBCO
		controllerAddress: "0xA421f87AaBdc0E071161b78A9a750fC2940B4E97",
		curveAddress: "0x27769D53C65491eeD8e0460e871B2F4cfB6a37E7",
		DAI: "0x349205F7378Bef80a70D65e465dAa45451DCbfb4",
		RewardToken: "0x5d0ebAB6136a8794DC302dEF53267bFB92D9315f",
		BancorFormula: "0x414f25B3A1Fc2c5f9D5642D2Ef72162d1C1DDbE2",
		connectorWeight: "20000",
	};
} else {
	apis = {
		hostname: 'http://localhost:3000/api/v1',
		socket: 'ws://localhost:3000/cable',
		indacoinHelperApi: 'https://web3-helper-staging.ovr.ai/indacoin',
		etherscan: 'https://rinkeby.etherscan.io/',
		cookieDomain: 'localhost',
		sumsubApi: 'https://test-api.sumsub.com',
		OVRContract: '0x4CbE615C151aeb453aab0516Ad7207C641Fe70dC',
		walletApproved: '0xda0b2EC0E8eE995e3257Bf99EA678e26651DbeEc',
		// IBCO - Originals
		controllerAddress: "0xA421f87AaBdc0E071161b78A9a750fC2940B4E97",
		curveAddress: "0x27769D53C65491eeD8e0460e871B2F4cfB6a37E7",
		DAI: "0x349205F7378Bef80a70D65e465dAa45451DCbfb4",
		RewardToken: "0x5d0ebAB6136a8794DC302dEF53267bFB92D9315f",
		BancorFormula: "0x414f25B3A1Fc2c5f9D5642D2Ef72162d1C1DDbE2",
		connectorWeight: "20000",
		// controllerAddress: "0x5B11662CEa51bc9E428e8d2363873e5D076eA9C9",
		// curveAddress: "0xbFEf65dE40346c45f892B98F9971913ba5ea0255",
		// DAI: "0x4DA8BE63a06c68fFE4810D5214405250869D1DAc",
		// RewardToken: "0xAD8439932f7DC64d421BD6734BcE5FEAbf139BcF",
		// BancorFormula: "0xD229699f25F052a82022048f97fdf623b7829C5C",
		// connectorWeight: "20000",
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
	web3network: environment === 'PRODUCTION' ? 1 : 4,
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