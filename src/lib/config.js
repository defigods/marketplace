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
		// Auctions
		OVRContract: '0x21BfBDa47A0B4B5b1248c767Ee49F7caA9B23697',
		walletApproved: '0x8ABa7FBaE92012c8A86C5182538A5dE11039Dad1',
		// IBCO 
		connectorWeight: "32500",
		controllerAddress:"0x5c0D928A3d86766E6c2Ca7378ABE76e7b2fF1028",
		curveAddress:"0x8c19cF0135852BA688643F57d56Be72bB898c411",
		DAI:"0x6B175474E89094C44Da98b954EedeAC495271d0F",
		RewardToken:"0x21BfBDa47A0B4B5b1248c767Ee49F7caA9B23697",
		BancorFormula:"0x6b2D3B366C3417C46240ab62c2878FfdA9861E73",
		firstOVRBlock: 11356495,

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
		// OVR - Rinkeby
		connectorWeight: "32500",
		DAI: "0xc719A57531850D56d59d8F66B915338b002883D8",
		RewardToken: "0xaC828Df5Cbb05c417f98FeC1b36dE596b5FC0ca2",
		BancorFormula: "0xf3C64493Cbbd4FeB549Ee0f5eb1c6D0F5c8D1680",
		curveAddress: "0x7531205Bf874CF7D1Ba1E4dE4355AEE0fA83C34E",
		controllerAddress: "0x9C13122f191a9A27A5eE94b12E771ABC1055d9b1",
		firstOVRBlock: 11356495,
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
		// IBCO - dOrg demo
		// controllerAddress: "0xcbc2E866D629aE2BCB597Cdf4dCb7dc2F8821Ee7",
		// curveAddress: "0x361A79A0dc80cc18383747F8147C885F414A829D",
		// DAI: "0xc0dF62a424aB40f34Ef08AE4e6fF3FA5C19cf0af",
		// RewardToken: "0xdc40B187fe113F64276b3082E35A50d2bb32D683",
		// BancorFormula: "0x8903235a94ebeC28F9b5b2d40DC0293cFd61d325",
		// connectorWeight: "20000",
		// firstOVRBlock: 7650000,
		// OVR - Rinkeby
		connectorWeight: "32500",
		DAI: "0xc719A57531850D56d59d8F66B915338b002883D8",
		RewardToken: "0xaC828Df5Cbb05c417f98FeC1b36dE596b5FC0ca2",
		BancorFormula: "0xf3C64493Cbbd4FeB549Ee0f5eb1c6D0F5c8D1680",
		curveAddress: "0x7531205Bf874CF7D1Ba1E4dE4355AEE0fA83C34E",
		controllerAddress: "0x9C13122f191a9A27A5eE94b12E771ABC1055d9b1",
		firstOVRBlock: 7650000,
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