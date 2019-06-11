const got = require('got');
const delay = require('delay');
const debug = require('debug')('@jope:ecobee');

/**
* The ecobee class.
* @param {Object} options
* @param {String} options.key API key
* @param {String} options.token OAuth access token
* @param {String} [options.url] base URL to use for requests
* @param {Number} [options.version] version of API
*
* @example
* const ecobee = new ECOBEE({key: 'example-key', token: 'example-token'});
* @class
*/
class ECOBEE {
  constructor({key, token, url = 'https://api.ecobee.com/', version = 1} = {}) {
    if (typeof key !== 'string') {
      throw new TypeError('invalid API key');
    }

    if (typeof token !== 'undefined' && typeof token !== 'string') {
      throw new TypeError('invalid access token');
    }

    if (typeof url !== 'string') {
      throw new TypeError('invalid url');
    }

    if (typeof version !== 'number') {
      throw new TypeError('invalid API version');
    }

    this.key = key;
    this.token = token;

    this.baseurl = url;

    this.version = version;

    this.client = got.extend({
      baseUrl: this.baseurl,
      json: true
    });
  }

  /**
   * Generates a PIN for PIN-based authentication.
   * @param {String} [scope] scope that generated PIN should have
   * @returns {Object}
   *
   * @example
   * const pin = await ecobee.generatePIN();
   */
  async generatePIN(scope = CONSTANTS.SCOPE.WRITE) {
    // Check scope
    if (Object.values(CONSTANTS.SCOPE).indexOf(scope) === -1) {
      throw new TypeError('invalid scope');
    }

    debug(`Generating PIN with scope ${scope}...`);

    try {
      const res = await this.client.get('authorize', {
        query: {
          response_type: 'ecobeePin',
          client_id: this.key,
          scope
        }
      });

      return res.body;
    } catch (error) {
      if (error.body && error.body.error_description) {
        throw new Error(error.body.error_description);
      } else {
        throw error;
      }
    }
  }

  /**
   * Checks whether a PIN has been granted access
   * to the associated user's account. Throws error
   * if the PIN has not been added.
   *
   * @param {String} authCode
   * authentication code from the generated PIN
   * @returns {Object} OAuth token object
   *
   * @example
   * const token = await ecobee.checkPINStatus('example-auth-code');
   */
  async checkPINStatus(authCode) {
    if (typeof authCode !== 'string') {
      throw new TypeError('invalid authentication code');
    }

    debug(`Checking PIN for auth code ${authCode}...`);

    try {
      const res = await this.client.post('token', {
        query: {
          code: authCode,
          client_id: this.key,
          grant_type: 'ecobeePin'
        }
      });

      return res.body;
    } catch (error) {
      if (error.body && error.body.error_description) {
        throw new Error(error.body.error_description);
      } else {
        throw error;
      }
    }
  }

  /**
   * Recursive helper function that polls
   * `checkPINStatus()`. Use after generating
   * a PIN and waiting for a user to add it.
   * @param {Object} options
   * @param {String} options.authCode
   * authentication code from the generated PIN
   * @param {Number} [options.interval=1]
   * interval, in seconds, to wait between polls
   * @param {Number} [options.maxAttempts=100]
   * maximum number of polls to make before throwing an error
   * @param {Number} attempts (for internal use, do not use)
   * @returns {Object} OAuth token object
   *
   * @example
   * const pin = await ecobee.generatePIN(CONSTANTS.SCOPE.WRITE);
   *
   * console.log(pin); // => add to your applications
   *
   * const token = await ecobee.waitForPIN({authCode: pin.code});
   *
   * console.log(token);
   */
  async waitForPIN(options = {}, attempts = 0) {
    const {authCode, interval = 1, maxAttempts = 100} = options;

    if (typeof authCode !== 'string') {
      throw new TypeError('invalid authentication code');
    }

    if (typeof interval !== 'number') {
      throw new TypeError('invalid interval');
    }

    if (typeof maxAttempts !== 'number') {
      throw new TypeError('invalid maxAttempts');
    }

    try {
      debug('Checking PIN...');

      const res = await this.checkPINStatus(authCode);

      this.setToken(res.access_token);

      return res;
    } catch (error) {
      debug('PIN not yet registered.');

      if (attempts < maxAttempts) {
        debug(`Waiting for ${interval} seconds...`);

        await delay(interval * 1000);

        return this.waitForPIN(options, ++attempts);
      }

      throw error;
    }
  }

  /**
   * Refreshes an OAuth token.
   * @param {String} refreshToken
   * @returns {Object} OAuth token object
   *
   * @example
   * const newToken = await ecobee.refreshToken('example-refresh-token');
   */
  async refreshToken(refreshToken) {
    if (typeof refreshToken !== 'string') {
      throw new TypeError('invalid refreshToken');
    }

    debug(`Refreshing access token with refresh token ${refreshToken}...`);

    try {
      const res = await this.client.post('token', {
        query: {
          code: refreshToken,
          client_id: this.key,
          grant_type: 'refresh_token'
        }
      });

      return res.body;
    } catch (error) {
      if (error.body && error.body.error_description) {
        throw new Error(error.body.error_description);
      } else {
        throw error;
      }
    }
  }

  /**
   * Sets the OAuth access token
   * that's used when making requests.
   * @param {String} token access token
   */
  setToken(token) {
    if (typeof token !== 'string') {
      throw new TypeError('invalid access token');
    }

    this.token = token;
  }

  /**
   * Polls thermostats to get when they
   * were last changed. This directly
   * maps to the ecobee API. For most
   * cases, you'll want to use
   * `pollThermostats()` instead.
   * @param {Object} selection
   * ecobee [Selection](https://www.ecobee.com/home/developer/api/documentation/v1/objects/Selection.shtml) object
   * @returns {Object}
   *
   * @example
   * const revisions = await ecobee.pollThermostatsRaw({
   *   registered: true,
   *   selectionType: 'registered'
   * });
   *
   * console.log(revisions);
   */
  pollThermostatsRaw(selection) {
    if (typeof selection !== 'object') {
      throw new TypeError('invalid selection');
    }

    return this.sendRequest({
      method: 'thermostatSummary',
      query: {
        json: JSON.stringify({selection})
      }
    });
  }

  /**
   * Polls thermostats to get when they
   * where last changed. This is a helper
   * function that wraps `pollThermostatsRaw()`,
   * and returns an object where the keys
   * are device identifiers.
   * @param {Object} selection
   * ecobee [Selection](https://www.ecobee.com/home/developer/api/documentation/v1/objects/Selection.shtml) object
   * @returns {Object}
   *
   * @example
   * const revisions = await ecobee.pollThermostatsRaw({
   *   registered: true,
   *   selectionType: 'registered'
   * });
   *
   * console.log(revisions);
   */
  async pollThermostats(selection) {
    if (typeof selection !== 'object') {
      throw new TypeError('invalid selection');
    }

    const res = await this.pollThermostatsRaw(selection);

    const thermostats = res.revisionList.reduce((accumulator, thermostat) => {
      const props = thermostat.split(':');

      accumulator[props[0]] = {
        name: props[1],
        connected: props[2],
        revisions: {
          thermostat: props[3],
          alerts: props[4],
          runtime: props[5],
          internal: props[6]
        }
      };

      return accumulator;
    }, {});

    return thermostats;
  }

  /**
   * Gets details of thermostats. This
   * directly maps to the ecobee API.
   * For most cases, you'll want to use
   * `getThermostats()` instead.
   * @param {Object} options
   * @param {Object} options.selection
   * ecobee [Selection](https://www.ecobee.com/home/developer/api/documentation/v1/objects/Selection.shtml) object
   * @param {Number} [options.page]
   * page number of results to return
   * @returns {Object}
   *
   * @example
   * const thermostats = await ecobee.getThermostatsRaw({
   *   selection: {
   *     registered: true,
   *     selectionType: 'registered',
   *     includeSettings: true
   *   }
   * });
   *
   * console.log(thermostats);
   */
  getThermostatsRaw({selection, page} = {}) {
    if (typeof selection !== 'object') {
      throw new TypeError('invalid selection');
    }

    if (page && typeof page !== 'number') {
      throw new TypeError('invalid page');
    }

    return this.sendRequest({
      method: 'thermostat',
      query: {
        json: JSON.stringify({selection, page})
      }
    });
  }

  /**
   * Gets details of thermostats. This
   * is a helper function that wraps
   * `getThermostatsRaw()`, and returns
   * an object where the keys are device
   * identifiers.
   * @param {Object} options
   * @param {Object} options.selection
   * ecobee [Selection](https://www.ecobee.com/home/developer/api/documentation/v1/objects/Selection.shtml) object
   * @param {Number} [options.page]
   * page number of results to return
   * @returns {Object}
   *
   * @example
   * const thermostats = await ecobee.getThermostats({
   *   selection: {
   *     registered: true,
   *     selectionType: 'registered',
   *     includeSettings: true
   *   }
   * });
   *
   * console.log(thermostats);
   */
  async getThermostats({selection, page}) {
    const res = await this.getThermostatsRaw({selection, page});

    const thermostats = res.thermostatList.reduce((accumulator, thermostat) => {
      return {...accumulator, [thermostat.identifier]: thermostat};
    }, {});

    return thermostats;
  }

  /**
   * Updates properties of thermostat(s).
   * @param {Object} options
   * @param {Object} options.selection
   * ecobee [Selection](https://www.ecobee.com/home/developer/api/documentation/v1/objects/Selection.shtml) object
   * @param {Object} [options.settings={}]
   * settings to update the thermostat with
   * (named the `thermostat` property in the ecobee docs)
   * @param {Array} [options.functions=[]]
   * special functions to apply
   * @returns {Object}
   *
   * @example
   * const update = await ecobee.updateThermostatsRaw({
   *   selection: {
   *     selectionType: 'thermostats',
   *     selectionMatch: '101010101010'
   *   },
   *   settings: {
   *     hvacMode: 'off'
   *   }
   * });
   *
   * console.log(update);
   */
  updateThermostatsRaw({selection, settings = {}, functions = []}) {
    if (typeof selection !== 'object') {
      throw new TypeError('invalid selection');
    }

    if (typeof settings !== 'object') {
      throw new TypeError('invalid settings');
    }

    if (functions.constructor !== Array) {
      throw new TypeError('invalid functions');
    }

    return this.sendRequest({
      method: 'thermostat',
      data: {
        selection,
        functions,
        thermostat: {settings}
      }
    });
  }

  /**
   * Update properties of thermostat(s).
   * Helper function that wraps `updateThermostatsRaw()`
   * to easily update properties by thermostat identifiers.
   * @param {Object} options
   * @param {Array} options.identifiers
   * thermostat identifiers to select
   * @param {Object} [options.settings={}]
   * settings to update the thermostat(s) with
   * (named the `thermostat` property in the ecobee docs)
   * @param {Array} [options.functions=[]]
   * special functions to apply
   * @returns {Object}
   *
   * @example
   * const update = await ecobee.updateThermostats({
   *   identifiers: ['101010101010'],
   *   settings: {
   *     hvacMode: 'off'
   *   }
   * });
   *
   * console.log(update);
   */
  updateThermostats({identifiers, settings = {}, functions = []}) {
    return this.updateThermostatsRaw({
      selection: {
        selectionType: 'thermostats',
        selectionMatch: identifiers.join(',')
      },
      settings,
      functions
    });
  }

  /**
   * Sends an API request.
   * @private
   * @param {Object} options
   * @param {String} options.method
   * URL method to call
   * @param {Object} [options.data={}]
   * data to POST
   * @param {Object} [options.query={}]
   * query to GET
   * @param {String} [options.httpMethod]
   * explicitly specifies HTTP method to use
   */
  async sendRequest(options) {
    let {method, data = {}, query = {}, httpMethod = false} = options;

    const headers = {
      Authorization: `Bearer ${this.token}`
    };

    let res;

    if (!httpMethod) {
      if (Object.keys(data).length === 0) {
        httpMethod = 'get';
      } else {
        httpMethod = 'post';
      }
    }

    try {
      debug(`${httpMethod.toUpperCase()}ing${httpMethod === 'get' ? '' : ' to'} '${method}' with query:`);
      debug(query);
      debug('and data:');
      debug(data);

      res = await this.client(`${this.version.toString()}/${method}`, {headers, query, method: httpMethod, body: data});

      debug('Got response:');
      debug(res.body);
    } catch (error) {
      if (error.body && error.body.error_description) {
        throw new Error(error.body.error_description);
      } else if (error.body && error.body.status) {
        throw new Error(error.body.status.message);
      } else {
        throw error;
      }
    }

    return res.body;
  }
}

const CONSTANTS = {
  SCOPE: {
    READ: 'smartRead',
    WRITE: 'smartWrite'
  }
};

module.exports = {ECOBEE, ECOBEE_CONSTANTS: CONSTANTS};
