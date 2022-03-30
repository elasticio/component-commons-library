"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.JsonataTransform = exports.JsonSchema = exports.CookieRestClient = exports.OAuth2RestClient = exports.NtlmRestClient = exports.NoAuthRestClient = exports.BasicAuthRestClient = exports.ApiKeyRestClient = exports.AttachmentProcessor = void 0;
/* eslint-disable max-classes-per-file */
const jsonSchemaConversionUtil_1 = require("./jsonSchema/jsonSchemaConversionUtil");
const jsonataTransform_1 = require("./jsonataTransform/jsonataTransform");
const logger_1 = require("./logger/logger");
var AttachmentProcessor_1 = require("./attachment/AttachmentProcessor");
Object.defineProperty(exports, "AttachmentProcessor", { enumerable: true, get: function () { return AttachmentProcessor_1.AttachmentProcessor; } });
var ApiKeyRestClient_1 = require("./authentication/ApiKeyRestClient");
Object.defineProperty(exports, "ApiKeyRestClient", { enumerable: true, get: function () { return ApiKeyRestClient_1.ApiKeyRestClient; } });
var BasicAuthRestClient_1 = require("./authentication/BasicAuthRestClient");
Object.defineProperty(exports, "BasicAuthRestClient", { enumerable: true, get: function () { return BasicAuthRestClient_1.BasicAuthRestClient; } });
var NoAuthRestClient_1 = require("./authentication/NoAuthRestClient");
Object.defineProperty(exports, "NoAuthRestClient", { enumerable: true, get: function () { return NoAuthRestClient_1.NoAuthRestClient; } });
var NtlmRestClient_1 = require("./authentication/NtlmRestClient");
Object.defineProperty(exports, "NtlmRestClient", { enumerable: true, get: function () { return NtlmRestClient_1.NtlmRestClient; } });
var OAuth2AuthorizationCodeRestClient_1 = require("./authentication/OAuth2AuthorizationCodeRestClient");
Object.defineProperty(exports, "OAuth2RestClient", { enumerable: true, get: function () { return OAuth2AuthorizationCodeRestClient_1.OAuth2RestClient; } });
var CookieRestClient_1 = require("./authentication/CookieRestClient");
Object.defineProperty(exports, "CookieRestClient", { enumerable: true, get: function () { return CookieRestClient_1.CookieRestClient; } });
class JsonSchema {
}
exports.JsonSchema = JsonSchema;
JsonSchema.convertJsonSchemaToEioSchema = jsonSchemaConversionUtil_1.convertJsonSchemaToEioSchema;
JsonSchema.makeSchemaInline = jsonSchemaConversionUtil_1.makeSchemaInline;
JsonSchema.convertDotNetTypeToJsonSchemaType = jsonSchemaConversionUtil_1.convertDotNetTypeToJsonSchemaType;
class JsonataTransform {
}
exports.JsonataTransform = JsonataTransform;
JsonataTransform.jsonataTransform = jsonataTransform_1.jsonataTransform;
class Logger {
}
exports.Logger = Logger;
Logger.getLogger = logger_1.getLogger;
