import _ from 'lodash';

//
// General Configs
//

// Possible values are STAGING, DEVELOPMENT, PRODUCTION
// If you have connection error set as STAGING
const environment = 'STAGING';

const apis = {
	hostname:
		environment === 'PRODUCTION'
			? 'http://localhost:3000/api/v1'
			: environment === 'STAGING'
			? 'https://mws-staging.ovr.ai/api/v1'
			: 'http://localhost:3000/api/v1', // DEVELOPMENT
	socket:
		environment === 'PRODUCTION'
			? 'ws://localhost:3000/cable'
			: environment === 'STAGING'
			? 'ws://localhost:3000/cable'
			: 'wss://mws-staging.ovr.ai/cable', // DEVELOPMENT
	creditCardApi:
		environment === 'PRODUCTION'
			? 'http://credit-card.ovr.ai/buy'
			: environment === 'STAGING'
			? 'http://staging-credit-card.ovr.ai/buy'
			: 'http://staging-credit-card.ovr.ai/buy', // DEVELOPMENT
	etherscan:
		environment === 'PRODUCTION'
			? 'https://etherscan.io/'
			: environment === 'STAGING'
			? 'https://ropsten.etherscan.io/'
			: 'https://ropsten.etherscan.io/' // DEVELOPMENT
};

const map = {
	lat: 46.0922495,
	lng: 13.2312417,
	zoom: 0,
	fillOpacity: 0.3,
	colorScale: ['#5F39BE', '#ffffff', '#1a0731', '#EC663C', '#0081DD'],
};

let config = {
	web3network: environment === 'PRODUCTION' ? '1' : '3',
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
