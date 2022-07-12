"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyRestClient = void 0;
const NoAuthRestClient_1 = require("./NoAuthRestClient");
class ApiKeyRestClient extends NoAuthRestClient_1.NoAuthRestClient {
    constructor(emitter, cfg) {
        super(emitter, cfg);
        this.apiKeyHeaderName = cfg.apiKeyHeaderName;
        this.apiKeyHeaderValue = cfg.apiKeyHeaderValue;
    }
    addAuthenticationToRequestOptions(requestOptions) {
        requestOptions.headers[this.apiKeyHeaderName] = this.apiKeyHeaderValue;
    }
}
exports.ApiKeyRestClient = ApiKeyRestClient;
