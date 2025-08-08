# component-commons-library
![](https://github.com/elasticio/splitter-component/blob/master/elastic.io%20Logo%20pure-01.png)
 
## Table of Contents
- [Description](#description)
- [Available Functions](#Available-Functions)
  - [Platform API Clients](#Platform-API-Clients)
    - [PlatformApiRestClient](#PlatformApiRestClient)
    - [PlatformApiLogicClient](#PlatformApiLogicClient)
  - [JSON Schema Converter](#JSON-Schema-Converter)
  - [JSON Transformation](#JSON-Transformation)
  - [Attachment Processor](#Attachment-Processor)
  - [External API](#external-api)
  - [Logger](#Logger)
- [License](#license)

# Description
This library provides some of the most common component development functionality in a simple, reusable way.

To install, type

```
npm install @elastic.io/component-commons-library
```

# Available Functions


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
- fetchSecretById - Fetch secret by id for a given workspace
- refreshTokenBySecretId - Refresh token by secret id for a given workspace
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

## External API

### Environment variables
* **API_RETRIES_COUNT** (defaults to 3): maximum amount of retries for 5xx errors. If server still responding 5xx, error will be thrown.
* **API_REQUEST_TIMEOUT** (defaults to 15000, min: 500, max: 120000): specifies the number of milliseconds before the request times out. If the request takes longer than timeout, the request will be aborted.

- `axiosReqWithRetryOnServerError` (use with `.call()` to pass context, implement it as a method of class with `logger` and `cfg` (value of configuration object for current action) values in a constructor) - function which makes axios request by specified request-config, making logging and error handling:
  1. If 5xx error occurred, it will be retried maximum `API_RETRIES_COUNT` times, each retry will be delayed with `exponentialSleep` function. 
  2. If 4xx error occurred - error will be thrown.
  3. If action `cfg` has `doNotThrow404` set to true: 404 error won't be treated as error. <br>
  Look on examples below.
- `getErrMsg` - forms error message from axios-response.
- `getRetryOptions` - return valid values for envs `API_RETRIES_COUNT` and `API_REQUEST_TIMEOUT`. If values are higher or lower the limit - they'll be overwritten by default values.
- `sleep` - return promise which resolves after N time.
- `exponentialDelay` - returns number of milliseconds depending to current retry. See [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) to explanation.
- `exponentialSleep` - return promise which resolves after N time. Where N is number of milliseconds from `exponentialDelay` execution.

Example for `axiosReqWithRetryOnServerError` function:
```javascript
class Client {
  private logger: any;

  private cfg: any;

  constructor(emitter, cfg) {
    this.logger = emitter.logger;
    this.cfg = cfg;
  }

   public async apiRequest(options: AxiosRequestConfig): Promise<any> {
    try {
      const response = await axiosReq.axiosReqWithRetryOnServerError(this, requestOptions);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
       // update token
      }
      throw error;
    }
  }

  public async getUserById(id) {
    return this.apiRequest({
      url: `/users/${id}`,
      method: 'GET',
    });
  }
}
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
