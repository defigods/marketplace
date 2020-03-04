import _ from 'lodash'

const apisDevelopment = true
const apis = {
  hostname: apisDevelopment ? 'http://localhost:3000/api/v1' : 'https://mws.ovr.ai/'
}
let config = {
  apis: apis 
}

export default config 



export function camelCaseKeys(object) {
  let camelCaseObject = _.cloneDeep(object)

  if (_.isArray(camelCaseObject)) {
    return _.map(camelCaseObject, camelCaseKeys)
  }
  if (_.isString(camelCaseObject)) {
    return camelCaseObject
  }
  camelCaseObject = _.mapKeys(camelCaseObject, (value, key) => _.camelCase(key))

  // Recursively apply throughout object
  return _.mapValues(camelCaseObject, (value) => {
    if (_.isPlainObject(value)) {
      return camelCaseKeys(value)
    } else if (_.isArray(value)) {
      return _.map(value, camelCaseKeys)
    }
    return value
  })
}
