# component-commons-library

## Table of Contents
- [Description](#description)
- [Available Functions](#Available-Functions)
  - [REST Clients](#REST-Clients)
    - [NoAuthRestClient](#NoAuthRestClient)
    - [BasicAuthRestClient](#BasicAuthRestClient)
    - [ApiKeyRestClient](#ApiKeyRestClient)
    - [CookieRestClient](#CookieRestClient)
    - [OAuth2AuthorizationCodeRestClient](#OAuth2AuthorizationCodeRestClient)
  - [JSON Schema Converter](#JSON-Schema-Converter)
  - [JSON Transformation](#JSON-Transformation)
  - [Attachment Processor](#Attachment-Processor)
  - [Logger](#Logger)
- [License](#license)

# Description
This library provides some of the most common component development functionality in a simple, reusable way.

To install, type 

```
npm install @elastic.io/component-commons-library
```

# Available Functions

## REST Clients
A number of REST Client classes are available to use and extend to create Clients for a given API.

Each of the REST Clients extends from the `NoAuthRestClient`, overriding the relevant methods.

### NoAuthRestClient
[NoAuthRestClient](https://github.com/elasticio/component-commons-library/blob/master/lib/authentication/NoAuthRestClient.ts) class to make rest requests no no auth APIs by provided options. 

#### constructor(emitter, configuration)
- emitter - EIO emitting context.
- configuration - configuration of EIO component object.

```
const Client = new NoAuthRestClient(emitter, configuration);
```

`configuration` can contains following properties:
 - baseURL: if request option `useBaseURLFromConfig` equal true, this baseURL will be used for request
 - followRedirect: if equal `false` maxRedirects request option will be set to 0
 - dontThrowError: if redirection is enabled but was failed will return response 
#### async makeRequest(options)
For making requests it is used `Axios` library, so options is the same as [axios options](https://www.npmjs.com/package/axios#request-config) and additional options: 
  - rebound: boolean, enable rebound 
  - useBaseURLFromConfig: boolean, if true baseURL will be used from configuration.
  - retry: number of retry for rebound
  - delay: delay for rebound


Class can be extended to have custom authentication

Example:

```javascript
const { NoAuthRestClient } = require('@elastic.io/component-commons-library');

class MyClient extends NoAuthRestClient {
  constructor(emitter, cfg) {
    super(emitter, cfg);
    // Other variables go here
  }

  // Some methods can be overridden
  addAuthenticationToRequestOptions(requestOptions) {
    requestOptions.specialField = true;
  }


}
```

### BasicAuthRestClient
[BasicAuthRestClient](https://github.com/elasticio/component-commons-library/blob/master/lib/authentication/BasicAuthRestClient.ts)
class extends [NoAuthRestClient](#NoAuthRestClient) class.
Makes requests to resource with basic auth.

#### constructor(emitter, cfg)
- cfg.username - mandatory cfg parameter contains username for authorization.
- cfg.password - mandatory cfg parameter contains password for authorization.

```
const Client = new BasicAuthRestClient(emitter, cfg, user, pass);
```


### ApiKeyRestClient
[ApiKeyRestClient](https://github.com/elasticio/component-commons-library/blob/master/lib/authentication/ApiKeyRestClient.ts)
class extends [NoAuthRestClient](#NoAuthRestClient) class.
Makes requests to resource with api key (custom header) auth.

#### constructor(emitter, cfg)
- cfg.apiKeyHeaderName - mandatory cfg parameter contains authorization header name.
- cfg.apiKeyHeaderValue - mandatory cfg parameter contains authorization header value.

```
const Client = new BasicAuthRestClient(emitter, cfg, user, pass);
```

### CookieRestClient
[CookieRestClient](https://github.com/elasticio/component-commons-library/blob/master/lib/authentication/CookieRestClient.ts)
class extends [NoAuthRestClient](#NoAuthRestClient) class.

TBD

### OAuth2AuthorizationCodeRestClient
[OAuth2RestClient](https://github.com/elasticio/component-commons-library/blob/master/lib/authentication/OAuth2AuthorizationCodeRestClient.ts)
class extends [NoAuthRestClient](#NoAuthRestClient) class.
Makes requests to resource with oauth2 access token auth.

#### constructor(emitter, cfg)
- cfg.oauth2 - mandatory cfg parameter contains oauth2 ids, config and tokens.
```
const Client = new OAuth2AuthorizationCodeRestClient(emitter, cfg);
```
This class can handle, refresh and emit oauth2 EIO configuration.



## JSON Schema Converter
Contains tools for JSON metadata generation

- ``` convertJsonSchemaToEioSchema(keyToReturn, completeSchemaOriginal) ``` - converts general JSON schema to platform-friendly JSON metadata
- ``` makeSchemaInline(json, availableSchemas) ``` - replaces _$ref_ recursively with full object description for provided _json_ object using _availableSchemas_ schemas map.

## JSON Transformation
Contains functions to transform platform data that contains JSONata expressions

- `jsonataTransform(msg, cfg)` - returns the `msg.body` with the JSONata expressions evaluated to values

## Attachment Processor
The attachment processor function can be used to store attachments on the platform. It exposes the following functions

- `uploadAttachment(streamContent)`, which will upload an attachment to the platform and return the result and file url
- `getAttachment(url, contentType)`, which will retrieve an attachment from the platform

Example:

```javascript
const { AttachmentProcessor } = require('@elastic.io/component-commons-library');

const stream = new Stream();
const result = await new AttachmentProcessor().uploadAttachment(stream);

const storedFileUrl = result.config.url;
```

## Logger
The built in logger uses Bunyan Logger as its base implementation. The available logger methods can be found [here](https://github.com/elasticio/component-commons-library/blob/master/lib/logger/logger.ts#L19).

Example:

```javascript
const { Logger } = require('@elastic.io/component-commons-library');

const logger = Logger.getLogger();
logger.info('Hello, world');
```

The `getLogger()` method takes an optional parameter `loggerName` that lets you declare multiple different loggers.

# License

Apache-2.0 © [elastic.io GmbH](http://www.elastic.io)
