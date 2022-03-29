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
