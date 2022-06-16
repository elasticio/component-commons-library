"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoAuthRestClient = void 0;
/* eslint-disable no-param-reassign,  no-underscore-dangle, class-methods-use-this */
const util_1 = require("util");
const remove_trailing_slash_1 = __importDefault(require("remove-trailing-slash"));
const remove_leading_slash_1 = __importDefault(require("remove-leading-slash"));
const request = (0, util_1.promisify)(require('request'));
class NoAuthRestClient {
    constructor(emitter, cfg) {
        this.emitter = emitter;
        this.cfg = cfg;
        this.request = request;
    }
    // @ts-ignore: no-unused-variable
    addAuthenticationToRequestOptions(requestOptions) {
    }
    handleRestResponse(response) {
        if (response.statusCode >= 400) {
            throw new Error(`Error in making request to ${response.request.uri.href} Status code: ${response.statusCode}, Body: ${JSON.stringify(response.body)}`);
        }
        this.emitter.logger.debug(`Response statusCode: ${response.statusCode}`);
        return response.body;
    }
    // options expects the following sub-variables:
    //    url: Url to call
    //    method: HTTP verb to use
    //    body: Body of the request, if applicable. Defaults to undefined.
    //    headers: Any HTTP headers to add to the request. Defaults to {}
    //    urlIsSegment: Whether to append to the base server url or
    //    if the provided URL is an absolute path. Defaults to true
    async makeRequest(options) {
        const { url, method, body, headers = {}, urlIsSegment = true, isJson = true, responseHandler, } = options;
        const urlToCall = urlIsSegment
            ? `${(0, remove_trailing_slash_1.default)(this.cfg.resourceServerUrl.trim())}/${(0, remove_leading_slash_1.default)(url.trim())}` // Trim trailing or leading '/'
            : url.trim();
        this.emitter.logger.debug(`Making ${method} request...`);
        const requestOptions = {
            method,
            body,
            headers,
            url: urlToCall,
            json: isJson,
        };
        // eslint-disable-next-line no-underscore-dangle
        await this.addAuthenticationToRequestOptions(requestOptions);
        const response = await this.request(requestOptions);
        if (responseHandler) {
            return responseHandler(response, this.handleRestResponse.bind(this));
        }
        return this.handleRestResponse(response);
    }
}
exports.NoAuthRestClient = NoAuthRestClient;
