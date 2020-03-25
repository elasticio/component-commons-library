"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NoAuthRestClient_1 = require("./NoAuthRestClient");
const ntlmRequest = require('@elastic.io/ntlm-client').request;
class NtlmRestClient extends NoAuthRestClient_1.NoAuthRestClient {
    constructor(emitter, cfg) {
        super(emitter, cfg);
        this.request = async function (requestOptions) {
            const { response } = await ntlmRequest({
                username: cfg.username,
                password: cfg.password,
                uri: requestOptions.url,
                method: requestOptions.method,
                request: {
                    json: requestOptions.json,
                    body: requestOptions.body,
                    headers: requestOptions.headers,
                },
            });
            return response;
        };
    }
}
exports.NtlmRestClient = NtlmRestClient;
//# sourceMappingURL=NtlmRestClient.js.map