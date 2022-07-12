# component-commons-library
![](https://github.com/elasticio/splitter-component/blob/master/elastic.io%20Logo%20pure-01.png)
 
## Table of Contents
- [Description](#description)
- [Available Functions](#Available-Functions)
  - [REST Clients](#REST-Clients)
    - [NoAuthRestClient](#NoAuthRestClient)
    - [BasicAuthRestClient](#BasicAuthRestClient)
    - [ApiKeyRestClient](#ApiKeyRestClient)
    - [CookieRestClient](#CookieRestClient)
    - [OAuth2AuthorizationCodeRestClient](#OAuth2AuthorizationCodeRestClient)
  - [Platform API Clients](#PlatformAPI-Clients)
    - [PlatformApiRestClient](#PlatformApiRestClient)
    - [PlatformApiLogicClient](#PlatformApiLogicClient)
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

Each of the REST Clients extends from the `NoAuthRestClient`, overriding the relevant methods. Exception is PlatformApiRestClient and PlatformApiLogicClient.

### NoAuthRestClient
[NoAuthRestClient](https://github.com/elasticio/component-commons-library/blob/master/src/authentication/NoAuthRestClient.ts) class to make rest requests no no auth APIs by provided options.

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
[BasicAuthRestClient](https://github.com/elasticio/component-commons-library/blob/master/src/authentication/BasicAuthRestClient.ts)
class extends [NoAuthRestClient](#NoAuthRestClient) class.
Makes requests to resource with basic auth.

#### constructor(emitter, cfg)
- cfg.username - mandatory cfg parameter contains username for authorization.
- cfg.password - mandatory cfg parameter contains password for authorization.

```
const Client = new BasicAuthRestClient(emitter, cfg, user, pass);
```


### ApiKeyRestClient
[ApiKeyRestClient](https://github.com/elasticio/component-commons-library/blob/master/src/authentication/ApiKeyRestClient.ts)
class extends [NoAuthRestClient](#NoAuthRestClient) class.
Makes requests to resource with api key (custom header) auth.

#### constructor(emitter, cfg)
- cfg.apiKeyHeaderName - mandatory cfg parameter contains authorization header name.
- cfg.apiKeyHeaderValue - mandatory cfg parameter contains authorization header value.

```
const Client = new BasicAuthRestClient(emitter, cfg, user, pass);
```

### CookieRestClient
[CookieRestClient](https://github.com/elasticio/component-commons-library/blob/master/src/authentication/CookieRestClient.ts)
class extends [NoAuthRestClient](#NoAuthRestClient) class.

TBD

### OAuth2AuthorizationCodeRestClient
[OAuth2RestClient](https://github.com/elasticio/component-commons-library/blob/master/src/authentication/OAuth2AuthorizationCodeRestClient.ts)
class extends [NoAuthRestClient](#NoAuthRestClient) class.
Makes requests to resource with oauth2 access token auth.

#### constructor(emitter, cfg)
- cfg.oauth2 - mandatory cfg parameter contains oauth2 ids, config and tokens.
```
const Client = new OAuth2AuthorizationCodeRestClient(emitter, cfg);
```
This class can handle, refresh and emit oauth2 EIO configuration.

### NtlmRestClient
[NtlmRestClient](https://github.com/elasticio/component-commons-library/blob/master/src/authentication/NtlmRestClient.ts)
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

## Platform API Clients
A number of Platform API Client classes are available to use and extend them to create Clients for Platform API.

### PlatformApiRestClient
[PlatformApiRestClient](https://github.com/elasticio/component-commons-library/blob/master/src/authentication/PlatformApiRestClient.ts)
class extends [BasicAuthRestClient](#BasicAuthRestClient) class.
The method inside this class checks for the status code 200, if not, then throws an error. And also checks that the response came with the correct data in the JSON format and the other expected response headers.

#### constructor(emitter, cfg)
- emitter - EIO emitting context.
- cfg - configuration of EIO component object.

```
const Client = new PlatformApiRestClient(emitter, cfg);
```

### PlatformApiLogicClient
[PlatformApiLogicClient](https://github.com/elasticio/component-commons-library/blob/master/src/authentication/PlatformApiLogicClient.ts)
class extends [PlatformApiRestClient](#PlatformApiRestClient) class.
Contains useful methods to manipulate flow's state to set it either to active running or to inactive stopped, searching flows, workspaces, credentials and more.

#### constructor(emitter, cfg)
- emitter - EIO emitting context.
- cfg - configuration of EIO component object.

```
const Client = new PlatformApiLogicClient(emitter, cfg);
```

#### List of methods
- fetchAllFlowsForWorkspace(options) - Fetch all flows for a given workspace
- fetchAllCredentialsForWorkspace(options) - Fetch all credentials for a given workspace
- fetchAllSecretsForWorkspace - Fetch all secrets for a given workspace
- fetchComponentsAccessibleFromContract(options) - Fetch All Components Accessible From a Given Workspace
- splitParallelization(maxParallelization, splitFactor) - Helping method to calculate right number of parallel calls
- fetchFlowList(options) - Fetches a list of flows
- fetchWorkspaceList(options) - Fetch a list of all workspaces across all contracts for a user
- fetchWorkspaceId(workspaceUniqueCriteria) - Given a set of unique criteria, find the workspace that matches
- removeNonWritableProperties(flow, includeDataSamples) - Given a flow, remove the properties of the flow that are regularly changed by the system such as last executed time
- fetchFlowId(flowUniqueCriteria) - Fetch flow by it's unique criteria
- fetchFlowById(id) - Fetch flow by it's id
- fetchFlowByNameAndWorkspaceId(flowName, workspaceId) - Fetch flow by flow name and workspace id
- changeFlowState(options) - Given a flow, change the flow to a given state (running, stopped, etc)
- startFlow(flowId, options) - sets the flow to active running state
- stopFlow(flowId, options) - sets the flow to inactive stopped state
- hydrateFlow(options) - Hydrates the flow using removeNonWritableProperties method, but additionally enriches the flow with all data samples, credential names, command and component Id fields.

## JSON Schema Converter
Contains tools for JSON metadata generation

- ``` convertJsonSchemaToEioSchema(keyToReturn, completeSchemaOriginal) ``` - converts general JSON schema to platform-friendly JSON metadata
- ``` makeSchemaInline(json, availableSchemas) ``` - replaces _$ref_ recursively with full object description for provided _json_ object using _availableSchemas_ schemas map.

## JSON Transformation
Contains functions to transform platform data that contains JSONata expressions

- `jsonataTransform(msg, cfg)` - returns the `msg.body` with the JSONata expressions evaluated to values

## Attachment Processor
The attachment processor function can be used to store attachments on the platform. It exposes the following functions

- `uploadAttachment(getAttachment, retryOptions, contentType)`, which will upload an attachment to the platform `Maester` storage and return the result object.
Where: <br>
 `getAttachment` - async function which returns stream <br>
 `retryOptions` - (optional): parameters for retrying of upload attachment, if request failed. Parameters are `retriesCount` and `requestTimeout`(ms)
 `contentType` - (optional): `Content-Type` of attachment. By default `Content-Type` will be calculated automatically. <br>
- `getAttachment(url, contentType)`, which will retrieve an attachment from `steward` or `maester` storage. To specify the storage - query parameter
`storage_type` must be provided. To get items from `maester` storage - `?storage_type=maester` should added to the `url` argument. By default attachments are retrieved from `steward` storage, so `?storage_type=steward` is not obligated to be added to the `url` argument. `contentType` -
one of [`stream`, `arraybuffer` ]

Example:

```javascript
const { AttachmentProcessor } = require('@elastic.io/component-commons-library');

const getAttachAsStream = async () => (
  await axios.get('http://sample.pdf', { responseType: 'stream' })
).data;
const result = await new AttachmentProcessor().uploadAttachment(getAttachAsStream, 'application/pdf');

const { objectId } = result.data;
```
```javascript
const { AttachmentProcessor } = require('@elastic.io/component-commons-library');

const result = await new AttachmentProcessor().getAttachment('http://example.com', 'stream'); // steward storage
const result = await new AttachmentProcessor().getAttachment('http://example.com?storage_type=steward', 'arraybuffer'); // steward storage
const result = await new AttachmentProcessor().getAttachment('http://example.com?storage_type=maester', 'stream'); // maester storage
```

## Logger
The built in logger uses Bunyan Logger as its base implementation. The available logger methods can be found [here](https://github.com/elasticio/component-commons-library/blob/master/src/logger/logger.ts#L19).

Example:

```javascript
const { Logger } = require('@elastic.io/component-commons-library');

const logger = Logger.getLogger();
logger.info('Hello, world');
```

The `getLogger()` method takes an optional parameter `loggerName` that lets you declare multiple different loggers.

# License

Apache-2.0 © [elastic.io GmbH](http://www.elastic.io)
