import test from 'ava';
import nock from 'nock';

import {ECOBEE, ECOBEE_CONSTANTS} from '../..';

import {
  generatePIN
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
