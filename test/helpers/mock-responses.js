const generatePIN = {
  ecobeePin: 'psix',
  code: '7xBj6qFkCdOgLdpGHMIphwGILRu9dzF8',
  scope: 'smartWrite',
  expires_in: 9,
  interval: 30
};

const generatedToken = {
  access_token: 'example-access-token',
  token_type: 'Bearer',
  expires_in: 3599,
  refresh_token: 'example-refresh-token',
  scope: 'smartWrite'
};

const pollThermostatsRaw = {
  thermostatCount: 2,
  revisionList:
   ['101010101010:HOME:true:190612095739:190611182126:190612142336:190612141500',
     '202020202020:Office:true:190611180138:190611121914:190612141723:190612141000'],
  statusList: [],
  status: {code: 0, message: ''}
};

const pollThermostats = {
  101010101010:
   {name: 'HOME',
     connected: 'true',
     revisions:
      {thermostat: '190612095739',
        alerts: '190611182126',
        runtime: '190612142336',
        internal: '190612141500'}},
  202020202020:
   {name: 'Office',
     connected: 'true',
     revisions:
      {thermostat: '190611180138',
        alerts: '190611121914',
        runtime: '190612141723',
        internal: '190612141000'}}
};

const getThermostatsRaw = {page: {page: 1, totalPages: 1, pageSize: 2, total: 2},
  thermostatList:
   [{identifier: '101010101010',
     name: 'HOME',
     thermostatRev: '190612095739',
     isRegistered: true,
     modelNumber: 'siSmart',
     brand: 'ecobee',
     features: 'Home',
     lastModified: '2019-06-12 09:57:39',
     thermostatTime: '2019-06-12 07:55:51',
     utcTime: '2019-06-12 14:55:51'},
   {identifier: '202020202020',
     name: 'Office',
     thermostatRev: '190611180138',
     isRegistered: true,
     modelNumber: 'nikeSmart',
     brand: 'ecobee',
     features: 'Home,HomeKit',
     lastModified: '2019-06-11 18:01:38',
     thermostatTime: '2019-06-12 07:55:51',
     utcTime: '2019-06-12 14:55:51'}],
  status: {code: 0, message: ''}};

const getThermostats = {
  page: {page: 1, totalPages: 1, pageSize: 2, total: 2},
  status: {code: 0, message: ''},
  thermostats: {
    101010101010:
   {identifier: '101010101010',
     name: 'HOME',
     thermostatRev: '190612095739',
     isRegistered: true,
     modelNumber: 'siSmart',
     brand: 'ecobee',
     features: 'Home',
     lastModified: '2019-06-12 09:57:39',
     thermostatTime: '2019-06-12 07:55:51',
     utcTime: '2019-06-12 14:55:51'},
    202020202020:
   {identifier: '202020202020',
     name: 'Office',
     thermostatRev: '190611180138',
     isRegistered: true,
     modelNumber: 'nikeSmart',
     brand: 'ecobee',
     features: 'Home,HomeKit',
     lastModified: '2019-06-11 18:01:38',
     thermostatTime: '2019-06-12 07:55:51',
     utcTime: '2019-06-12 14:55:51'}
  }
};

const updateThermostatsRaw = {status: {code: 0, message: ''}};

module.exports = {generatePIN, generatedToken, pollThermostatsRaw, pollThermostats, getThermostatsRaw, getThermostats, updateThermostatsRaw};
