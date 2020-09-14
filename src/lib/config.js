import _ from 'lodash';

//
// General Configs
//

// Possible values are STAGING, DEVELOPMENT, PRODUCTION
const environment = 'DEVELOPMENT';

let apis;

if (environment === 'PRODUCTION') {
	apis = {
		hostname: 'http://localhost:3000/api/v1',
		socket: 'wss://localhost:3000/cable',
		indacoinHelperApi: 'https://web3-helper.ovr.ai/indacoin',
		etherscan: 'https://etherscan.io/',
		cookieDomain: 'ovr.ai',
		sumsubApi: 'https://api.sumsub.com',
	};
} else if (environment === 'STAGING') {
	apis = {
		hostname: 'https://mws-staging.ovr.ai/api/v1',
		socket: 'wss://mws-staging.ovr.ai/cable',
		indacoinHelperApi: 'https://web3-helper-staging.ovr.ai/indacoin',
		etherscan: 'https://ropsten.etherscan.io/',
		cookieDomain: 'ovr.ai',
		sumsubApi: 'https://test-api.sumsub.com',
	};
} else {
	apis = {
		hostname: 'http://localhost:3000/api/v1',
		socket: 'ws://localhost:3000/cable',
		indacoinHelperApi: 'https://web3-helper-staging.ovr.ai/indacoin',
		etherscan: 'https://ropsten.etherscan.io/',
		cookieDomain: 'localhost',
		sumsubApi: 'https://test-api.sumsub.com',
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
	web3network: environment === 'PRODUCTION' ? '1' : '3',
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
