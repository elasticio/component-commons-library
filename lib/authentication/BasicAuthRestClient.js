"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NoAuthRestClient_1 = require("./NoAuthRestClient");
class BasicAuthRestClient extends NoAuthRestClient_1.NoAuthRestClient {
    constructor(emitter, cfg) {
        super(emitter, cfg);
        this.username = cfg.username;
        this.password = cfg.password;
    }
    addAuthenticationToRequestOptions(requestOptions) {
        requestOptions.auth = {
            username: this.username,
            password: this.password,
        };
    }
}
exports.BasicAuthRestClient = BasicAuthRestClient;
//# sourceMappingURL=BasicAuthRestClient.js.map