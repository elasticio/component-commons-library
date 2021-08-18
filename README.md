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

#### constructor(emitter, cfg)
- emitter - EIO emitting context.
- cfg - configuration of EIO component object.

```
const Client = new NoAuthRestClient(emitter, cfg);
```

#### async makeRequest(options)
Makes requests:
options expects the following sub-variables:
  - url: Url to call
  - method: HTTP verb to use
  - body: Body of the request, if applicable. Defaults to undefined.
  - headers: Any HTTP headers to add to the request. Defaults to {}
  - urlIsSegment: Whether to append to the base server url or if the provided URL is an absolute path. Defaults to true
  - isJson: If the request is in JSON format. Defaults to true


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

### NtlmRestClient
[NtlmRestClient](https://github.com/elasticio/component-commons-library/blob/master/lib/authentication/NtlmRestClient.ts)
class extends [NoAuthRestClient](#NoAuthRestClient) class.
Makes requests to resource with [NTLM authentication](https://en.wikipedia.org/wiki/NT_LAN_Manager).
Falls back to basic authentication if NTLM authentication fails.
Handles both V1 and V2 of the NTLM Protocol.

#### constructor(emitter, cfg)
- cfg.username - mandatory cfg parameter contains username for authorization.  Domain information should be combined with this field. (e.g. `SOMEDOMAIN\SomeUser`)
- cfg.password - mandatory cfg parameter contains password for authorization.

```
const Client = new NtlmRestClient(emitter, cfg);
```

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
- `getAttachment(url, contentType)`, which will retrieve an attachment from `steward` or `maester` storage. To specify the storage - query parameter
`storage_type` must be provided. To get items from `maester` storage - `?storage_type=maester` should added to the `url` argument. By default attachments are retrieved from `steward` storage, so `?storage_type=steward` is not obligated to be added to the `url` argument. `contentType` -
one of [`stream`, `arraybuffer` ]

Example:

```javascript
const { AttachmentProcessor } = require('@elastic.io/component-commons-library');

const stream = new Stream();
const result = await new AttachmentProcessor().uploadAttachment(stream);

const storedFileUrl = result.config.url;
```
```javascript
const { AttachmentProcessor } = require('@elastic.io/component-commons-library');

const result = await new AttachmentProcessor().getAttachment('http://example.com', 'stream'); // steward storage
const result = await new AttachmentProcessor().getAttachment('http://example.com?storage_type=steward', 'arraybuffer'); // steward storage
const result = await new AttachmentProcessor().getAttachment('http://example.com?storage_type=maester', 'stream'); // maester storage
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
