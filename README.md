# @jope-io/ecobee

A Nodejs wrapper for the [ecobee API](https://www.ecobee.com/home/developer/api/introduction/index.shtml).

## Quickstart

```javascript
const {ECOBEE, ECOBEE_CONSTANTS} = require('@jope-io/ecobee');

const ecobee = new ECOBEE({
  key: 'example-key'
});

(async () => {
  // Generate application PIN
  const pin = await ecobee.generatePIN(ECOBEE_CONSTANTS.SCOPE.WRITE);

  console.log('Generated PIN:', pin); // => add to your applications on your account

  // Poll and wait for PIN to be added
  // (returned access token is automatically saved in class instance)
  const token = await ecobee.waitForPIN({authCode: pin.code});

  console.log('Generated token:', token); // => generated OAuth token (save the refresh token somewhere)

  const thermostats = await ecobee.getThermostats({
    selection: {
      registered: true,
      selectionType: 'registered',
      includeSettings: true
    }
  });

  console.log(thermostats); // => thermostats associated with user's account
})();
```

## Docs

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

-   [ECOBEE](#ecobee)
    -   [Parameters](#parameters)
    -   [Examples](#examples)
    -   [generatePIN](#generatepin)
        -   [Parameters](#parameters-1)
        -   [Examples](#examples-1)
    -   [checkPINStatus](#checkpinstatus)
        -   [Parameters](#parameters-2)
        -   [Examples](#examples-2)
    -   [getTokenByCode](#gettokenbycode)
        -   [Parameters](#parameters-3)
        -   [Examples](#examples-3)
    -   [waitForPIN](#waitforpin)
        -   [Parameters](#parameters-4)
        -   [Examples](#examples-4)
    -   [refreshToken](#refreshtoken)
        -   [Parameters](#parameters-5)
        -   [Examples](#examples-5)
    -   [setToken](#settoken)
        -   [Parameters](#parameters-6)
    -   [pollThermostatsRaw](#pollthermostatsraw)
        -   [Parameters](#parameters-7)
        -   [Examples](#examples-6)
    -   [pollThermostats](#pollthermostats)
        -   [Parameters](#parameters-8)
        -   [Examples](#examples-7)
    -   [getThermostatsRaw](#getthermostatsraw)
        -   [Parameters](#parameters-9)
        -   [Examples](#examples-8)
    -   [getThermostats](#getthermostats)
        -   [Parameters](#parameters-10)
        -   [Examples](#examples-9)
    -   [updateThermostatsRaw](#updatethermostatsraw)
        -   [Parameters](#parameters-11)
        -   [Examples](#examples-10)
    -   [updateThermostats](#updatethermostats)
        -   [Parameters](#parameters-12)
        -   [Examples](#examples-11)

### ECOBEE

The ecobee class.

#### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**  (optional, default `{}`)
    -   `options.key` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** API key
    -   `options.token` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** OAuth access token
    -   `options.url` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** base URL to use for requests (optional, default `'https://api.ecobee.com/'`)
    -   `options.version` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** version of API (optional, default `1`)

#### Examples

```javascript
const ecobee = new ECOBEE({key: 'example-key', token: 'example-token'});
```

#### generatePIN

Generates a PIN for PIN-based authentication.

##### Parameters

-   `scope` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** scope that generated PIN should have (optional, default `CONSTANTS.SCOPE.WRITE`)

##### Examples

```javascript
const pin = await ecobee.generatePIN();
```

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

#### checkPINStatus

Checks whether a PIN has been granted access
to the associated user's account. Throws error
if the PIN has not been added.

##### Parameters

-   `authCode` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** authentication code from the generated PIN

##### Examples

```javascript
const token = await ecobee.checkPINStatus('example-auth-code');
```

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** OAuth token object

#### getTokenByCode

Gets token by an authorization code.

##### Parameters

-   `authCode` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** authorization code
-   `redirectURI` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the redirect URI of your token grant flow

##### Examples

```javascript
const token = await ecobee.getTokenByCode('example-auth-code');
```

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** OAuth token object

#### waitForPIN

Recursive helper function that polls
`checkPINStatus()`. Use after generating
a PIN and waiting for a user to add it.

##### Parameters

-   `authCode` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** authentication code from the generated PIN
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**  (optional, default `{}`)
    -   `options.interval` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** interval, in seconds, to wait between polls (optional, default `1`)
    -   `options.maxAttempts` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** maximum number of polls to make before throwing an error (optional, default `100`)
-   `attempts` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (for internal use, do not use) (optional, default `0`)

##### Examples

```javascript
const pin = await ecobee.generatePIN(CONSTANTS.SCOPE.WRITE);

console.log(pin); // => add to your applications

const token = await ecobee.waitForPIN({authCode: pin.code});

console.log(token);
```

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** OAuth token object

#### refreshToken

Refreshes an OAuth token.

##### Parameters

-   `refreshToken` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

##### Examples

```javascript
const newToken = await ecobee.refreshToken('example-refresh-token');
```

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** OAuth token object

#### setToken

Sets the OAuth access token
that's used when making requests.

##### Parameters

-   `token` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** access token

#### pollThermostatsRaw

Polls thermostats to get when they
were last changed. This directly
maps to the ecobee API. For most
cases, you'll want to use
`pollThermostats()` instead.

##### Parameters

-   `selection` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** ecobee [Selection](https://www.ecobee.com/home/developer/api/documentation/v1/objects/Selection.shtml) object

##### Examples

```javascript
const revisions = await ecobee.pollThermostatsRaw({
  registered: true,
  selectionType: 'registered'
});

console.log(revisions);
```

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

#### pollThermostats

Polls thermostats to get when they
where last changed. This is a helper
function that wraps `pollThermostatsRaw()`,
and returns an object where the keys
are device identifiers.

##### Parameters

-   `selection` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** ecobee [Selection](https://www.ecobee.com/home/developer/api/documentation/v1/objects/Selection.shtml) object

##### Examples

```javascript
const revisions = await ecobee.pollThermostatsRaw({
  registered: true,
  selectionType: 'registered'
});

console.log(revisions);
```

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

#### getThermostatsRaw

Gets details of thermostats. This
directly maps to the ecobee API.
For most cases, you'll want to use
`getThermostats()` instead.

##### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**  (optional, default `{}`)
    -   `options.selection` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** ecobee [Selection](https://www.ecobee.com/home/developer/api/documentation/v1/objects/Selection.shtml) object
    -   `options.page` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** page number of results to return

##### Examples

```javascript
const thermostats = await ecobee.getThermostatsRaw({
  selection: {
    registered: true,
    selectionType: 'registered',
    includeSettings: true
  }
});

console.log(thermostats);
```

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

#### getThermostats

Gets details of thermostats. This
is a helper function that wraps
`getThermostatsRaw()`, and returns
an object where the keys are device
identifiers.

##### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**  (optional, default `{}`)
    -   `options.selection` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** ecobee [Selection](https://www.ecobee.com/home/developer/api/documentation/v1/objects/Selection.shtml) object
    -   `options.page` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** page number of results to return

##### Examples

```javascript
const thermostats = await ecobee.getThermostats({
  selection: {
    registered: true,
    selectionType: 'registered',
    includeSettings: true
  }
});

console.log(thermostats);
```

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

#### updateThermostatsRaw

Updates properties of thermostat(s).

##### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**  (optional, default `{}`)
    -   `options.selection` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** ecobee [Selection](https://www.ecobee.com/home/developer/api/documentation/v1/objects/Selection.shtml) object
    -   `options.settings` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** settings to update the thermostat with
        (named the `thermostat` property in the ecobee docs) (optional, default `{}`)
    -   `options.functions` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** special functions to apply (optional, default `[]`)

##### Examples

```javascript
const update = await ecobee.updateThermostatsRaw({
  selection: {
    selectionType: 'thermostats',
    selectionMatch: '101010101010'
  },
  settings: {
    hvacMode: 'off'
  }
});

console.log(update);
```

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

#### updateThermostats

Update properties of thermostat(s).
Helper function that wraps `updateThermostatsRaw()`
to easily update properties by thermostat identifiers.

##### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**  (optional, default `{}`)
    -   `options.identifiers` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** thermostat identifiers to select
    -   `options.settings` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** settings to update the thermostat(s) with
        (named the `thermostat` property in the ecobee docs) (optional, default `{}`)
    -   `options.functions` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** special functions to apply (optional, default `[]`)

##### Examples

```javascript
const update = await ecobee.updateThermostats({
  identifiers: ['101010101010'],
  settings: {
    hvacMode: 'off'
  }
});

console.log(update);
```

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
