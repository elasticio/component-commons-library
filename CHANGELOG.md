## 3.2.2 (March 14, 2025)
* Updated maester-client to 6.0.0

## 3.2.1 (September 11, 2024)
* Updated maester-client

## 3.2.0 (March 22, 2024)
* Added new functions:
  * isNumberNaN(number)
  * timestamp(date)
  * isDateValid(date)
  * timeToString(date)
* Updated @elastic.io/jsonata-moment to 1.1.6 to fix a vulnerability found in jsonata 1.8.6

## 3.1.6 (January 24, 2024)
* Changed environment variable `API_REQUEST_TIMEOUT` maxValue to 120 sec (used to be 20 sec)

## 3.1.5 (December 29, 2022)
* Updated @elasticio/maester-client to v5.0.1

## 3.1.4 (November 29, 2022)
* To fix the incorrect deploy of 3.1.3

## 3.1.3 (November 29, 2022)
* Add possibility to set RetryOptions for methods `getAttachment` and `uploadAttachment` oa AttachmentProcessor class.

## 3.1.2 (October 28, 2022)
* To fix the incorrect deploy of 3.1.1

## 3.1.1 (October 21, 2022)
* Update jsonata-moment to 1.1.5

## 3.1.0 (September 9, 2022)
* Added method `fetchSecretById` for `PlatformApiLogicClient`
* Added method `refreshTokenBySecretId` for `PlatformApiLogicClient`
* Added User-Agent headers to `PlatformApiRestClient`
* Added new REST client `FacelessRestClient`

## 3.0.2 (August 26, 2022)
* Updated @elasticio/maester-client to v4.0.3

## 3.0.1 (August 12, 2022)
* Increase default values and limits for envs `API_RETRIES_COUNT` and `API_REQUEST_TIMEOUT`
* Add `axiosReqWithRetryOnServerError` function to proceed with most commons use cases of making query to external API
* Updated @elasticio/maester-client to v4.0.2

## 3.0.0 (July 25, 2022)
* Updated method `uploadAttachment` from `AttachmentProcessor`
* Added method `getMaesterAttachmentUrlById` which return url to Maester attachment
* Updated @elasticio/maester-client to v4.0.0
* Updated Circle.ci config

## 2.1.0 (May 06, 2022)
* Now method `uploadAttachment` from `AttachmentProcessor` automatically sets the `contentType`
* Fixed retrying logic for method `uploadAttachment`
* Removed validation of the file size (`REQUEST_MAX_BODY_LENGTH` env) because it not works with streams 

## 2.0.2 (April 13, 2022)
* Fix dependencies

## 2.0.1 (March 29, 2022)
- Increase `REQUEST_MAX_BODY_LENGTH` to 100MB

## 2.0.0 (January 14, 2022)
* Now method `uploadAttachment` from `AttachmentProcessor` saves attachments directly to `Maester`
* Now method `uploadAttachment` from `AttachmentProcessor` accepts additional argument `contentType`
* Update dev dependencies

## 1.2.0 (November 12, 2021)
* Added `fetchAllSecretsForWorkspace` method to `PlatformApiLogicClient`

## 1.1.7 (August 30, 2021)
* Added `PlatformApiRestClient` and `PlatformApiLogicClient` classes from `IPaaS-core-component`

## 1.1.6 (July 29, 2021)
* Now `getAttachment` from `AttachmentProcessor` may retrieve items from `Maester`

## 1.1.5 (October 29, 2020)
* Allow the response handler to be overridden at a per request level.
* Bump dependencies.

## 1.1.4 (October 20, 2020)
* Annual audit of the component code to check if it exposes a sensitive data in the logs

## 1.1.3 (September 25, 2020)
* Don't log sensitive data
* Update dependencies
* Set minimum node version to v12.

## 1.1.2 (March 24, 2020)

### Bug fixes

* Fix subsequent calls to Jsonata Transform error
## Note
* `JsontaTransform.jsonataTransform` now will not change body of input message

## 1.1.1 (March 24, 2020)

### General Changes

* Changed Node version to >= 8.16.0

## 1.1.0 (March 23, 2020)

### General Changes

* Add New Jsonta fuctions getFlowVariables() and getPassthrough


## 1.0.0 (March 06, 2020)

### General Changes

* Add New NTLM REST Client
* Fix Package Dependency Security Problem
* Adapt Proper Semantic Versioning
