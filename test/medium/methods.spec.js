import test from 'ava';
import nock from 'nock';

import {ECOBEE, ECOBEE_CONSTANTS} from '../..';

import {
  generatePIN,
  generatedToken,
  pollThermostatsRaw,
  pollThermostats,
  getThermostatsRaw,
  getThermostats,
  updateThermostatsRaw
} from '../helpers/mock-responses';

const API_KEY = 'example-key';
const URL = 'https://api.ecobee.com/';

const eb = new ECOBEE({key: API_KEY, url: URL});

test('generate PIN', async t => {
  nock(URL)
    .get('/authorize')
    .query({
      response_type: 'ecobeePin',
      client_id: API_KEY,
      scope: ECOBEE_CONSTANTS.SCOPE.WRITE
    })
    .reply(200, generatePIN);

  const pin = await eb.generatePIN(ECOBEE_CONSTANTS.SCOPE.WRITE);

  t.deepEqual(pin, generatePIN);
});

test('check PIN status', async t => {
  nock(URL)
    .post('/token')
    .query({
      code: 'example-auth-code',
      client_id: API_KEY,
      grant_type: 'ecobeePin'
    })
    .reply(200, generatedToken);

  const token = await eb.checkPINStatus('example-auth-code');

  t.deepEqual(token, generatedToken);
});

test('wait for PIN', async t => {
  nock(URL)
    .post('/token')
    .query({
      code: 'example-auth-code',
      client_id: API_KEY,
      grant_type: 'ecobeePin'
    })
    .twice()
    .reply(500, 'Waiting for user to authorize application.')
    .post('/token')
    .query({
      code: 'example-auth-code',
      client_id: API_KEY,
      grant_type: 'ecobeePin'
    })
    .reply(200, generatedToken);

  const token = await eb.waitForPIN('example-auth-code', {interval: 0.1});

  t.deepEqual(token, generatedToken);
});

test('refresh token', async t => {
  nock(URL)
    .post('/token')
    .query({
      code: 'example-refresh-token',
      client_id: API_KEY,
      grant_type: 'refresh_token'
    })
    .reply(200, generatedToken);

  const newToken = await eb.refreshToken('example-refresh-token');

  t.deepEqual(newToken, generatedToken);
});

test('set token', t => {
  eb.setToken('example-access-token');

  t.is(eb.token, 'example-access-token');
});

test('poll thermostats raw', async t => {
  const selection = {
    registered: true,
    selectionType: 'registered'
  };

  nock(URL)
    .get('/1/thermostatSummary')
    .query({
      json: JSON.stringify({selection})
    })
    .reply(200, pollThermostatsRaw);

  const res = await eb.pollThermostatsRaw(selection);

  t.deepEqual(res, pollThermostatsRaw);
});

test('poll thermostats', async t => {
  const selection = {
    registered: true,
    selectionType: 'registered'
  };

  nock(URL)
    .get('/1/thermostatSummary')
    .query({
      json: JSON.stringify({selection})
    })
    .reply(200, pollThermostatsRaw);

  const res = await eb.pollThermostats(selection);

  t.deepEqual(res, pollThermostats);
});

test('get thermostats raw', async t => {
  const selection = {
    registered: true,
    selectionType: 'registered'
  };

  nock(URL)
    .get('/1/thermostat')
    .query({
      json: JSON.stringify({selection})
    })
    .reply(200, getThermostatsRaw);

  const res = await eb.getThermostatsRaw({selection});

  t.deepEqual(res, getThermostatsRaw);
});

test('get thermostats', async t => {
  const selection = {
    registered: true,
    selectionType: 'registered'
  };

  nock(URL)
    .get('/1/thermostat')
    .query({
      json: JSON.stringify({selection})
    })
    .reply(200, getThermostatsRaw);

  const res = await eb.getThermostats({selection});

  t.deepEqual(res, getThermostats);
});

test('update thermostats raw', async t => {
  const selection = {
    registered: true,
    selectionType: 'registered'
  };

  const settings = {
    hvacMode: 'off'
  };

  nock(URL)
    .post('/1/thermostat', {
      selection,
      functions: [],
      thermostat: {settings}
    })
    .reply(200, updateThermostatsRaw);

  const res = await eb.updateThermostatsRaw({selection, settings});

  t.deepEqual(res, updateThermostatsRaw);
});

test('update thermostats', async t => {
  const settings = {
    hvacMode: 'off'
  };

  nock(URL)
    .post('/1/thermostat', {
      selection: {selectionType: 'thermostats', selectionMatch: '101010101010'},
      functions: [],
      thermostat: {settings}
    })
    .reply(200, updateThermostatsRaw);

  const res = await eb.updateThermostats({
    identifiers: ['101010101010'],
    settings
  });

  t.deepEqual(res, updateThermostatsRaw);
});
