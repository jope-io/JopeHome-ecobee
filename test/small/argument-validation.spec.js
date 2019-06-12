/* eslint no-new: 0 */
import test from 'ava';

import {ECOBEE} from '../..';

const eb = new ECOBEE({key: 'example-key'});

test('constructor validation', t => {
  const invalidKey = t.throws(() => {
    new ECOBEE();
  });

  t.is(invalidKey.message, 'invalid API key');

  const invalidToken = t.throws(() => {
    new ECOBEE({
      key: 'example-key',
      token: {token: 'bad-token'}
    });
  });

  t.is(invalidToken.message, 'invalid access token');

  const invalidURL = t.throws(() => {
    new ECOBEE({
      key: 'example-key',
      url: {url: 'bad-url'}
    });
  });

  t.is(invalidURL.message, 'invalid url');

  const invalidVersion = t.throws(() => {
    new ECOBEE({
      key: 'example-key',
      version: {version: 'bad-version'}
    });
  });

  t.is(invalidVersion.message, 'invalid API version');
});

test('generate PIN validation', async t => {
  const invalidScope = await t.throwsAsync(() => eb.generatePIN('read/write'));

  t.is(invalidScope.message, 'invalid scope');
});

test('check PIN status validation', async t => {
  const invalidAuthCode = await t.throwsAsync(() => eb.checkPINStatus({authCode: 'bad-auth-code'}));

  t.is(invalidAuthCode.message, 'invalid authentication code');
});

test('wait for PIN validation', async t => {
  const invalidAuthCode = await t.throwsAsync(() => eb.waitForPIN());

  t.is(invalidAuthCode.message, 'invalid authentication code');

  const invalidInterval = await t.throwsAsync(() => eb.waitForPIN('example-auth-code', {
    interval: '5s'
  }));

  t.is(invalidInterval.message, 'invalid interval');

  const invalidMaxAttempts = await t.throwsAsync(() => eb.waitForPIN('example-auth-code', {
    authCode: 'example-auth-code',
    maxAttempts: '100'
  }));

  t.is(invalidMaxAttempts.message, 'invalid maxAttempts');
});

test('refresh token validation', async t => {
  const invalidRefreshToken = await t.throwsAsync(() => eb.refreshToken());

  t.is(invalidRefreshToken.message, 'invalid refreshToken');
});

test('set token validation', t => {
  const invalidSetToken = t.throws(() => eb.setToken());

  t.is(invalidSetToken.message, 'invalid access token');
});

test('poll thermostats validation', async t => {
  const invalidSelection = await t.throwsAsync(() => eb.pollThermostats());

  t.is(invalidSelection.message, 'invalid selection');
});

test('get thermostats validation', async t => {
  const invalidSelection = await t.throwsAsync(() => eb.getThermostats());

  t.is(invalidSelection.message, 'invalid selection');

  const invalidPage = await t.throwsAsync(() => eb.getThermostats({
    selection: {},
    page: '1'
  }));

  t.is(invalidPage.message, 'invalid page');
});

test('update thermostats validation', t => {
  const invalidSettings = t.throws(() => eb.updateThermostats({
    identifier: '101010101010',
    settings: ''
  }));

  t.is(invalidSettings.message, 'invalid settings');

  const invalidFunctions = t.throws(() => eb.updateThermostats({
    identifier: '101010101010',
    functions: ''
  }));

  t.is(invalidFunctions.message, 'invalid functions');
});
