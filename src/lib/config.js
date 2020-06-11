import _ from 'lodash';

//
// General Configs
//

// Possible values are STAGING, DEVELOPMENT, PRODUCTION
// If you have connection error set as STAGING
const environment = 'DEVELOPMENT';

const apis = {
	hostname:
		environment === 'PRODUCTION'
			? 'http://localhost:3000/api/v1'
			: (environment === 'STAGING' ? 'http://47.254.135.104:8003/api/v1' : 'http://localhost:3000/api/v1'),
	socket:
		environment === 'PRODUCTION'
			? 'ws://localhost:3000/cable'
			: (environment === 'STAGING' ? 'ws://47.254.135.104:8003/cable' : 'ws://localhost:3000/cable')
};

const map = {
	lat: 46.0922495,
	lng: 13.2312417,
	zoom: 0,
	fillOpacity: 0.3,
	colorScale: ['#5F39BE', '#ffffff', '#1a0731', '#EC663C', '#0081DD'],
};

let config = {
	web3network:
	environment === 'PRODUCTION'
		? "1"
		: "3",
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
