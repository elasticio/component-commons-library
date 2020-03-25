"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-param-reassign,  no-underscore-dangle, class-methods-use-this */
const util_1 = require("util");
const request_1 = __importDefault(require("request"));
const NoAuthRestClient_1 = require("./NoAuthRestClient");
const requestCall = util_1.promisify(request_1.default);
class CookieRestClient extends NoAuthRestClient_1.NoAuthRestClient {
    constructor(emitter, cfg) {
        super(emitter, cfg);
        this.jar = request_1.default.jar();
        this.loggedIn = false;
    }
    basicResponseCheck(response) {
        if (response.statusCode >= 400) {
            throw new Error(`Error in authentication.  Status code: ${response.statusCode}, Body: ${JSON.stringify(response.body)}`);
        }
    }
    handleLoginResponse(response) {
        this.basicResponseCheck(response);
    }
    handleLogoutResponse(response) {
        this.basicResponseCheck(response);
    }
    async login() {
        this.emitter.logger.info('Performing Login ...');
        const loginResponse = await requestCall({
            method: 'POST',
            url: this.cfg.loginUrl,
            form: {
                username: this.cfg.username,
                password: this.cfg.password,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            jar: this.jar,
        });
        this.handleLoginResponse(loginResponse);
        this.loggedIn = true;
        this.emitter.logger.info('Login Complete.');
    }
    async logout() {
        if (this.cfg.logoutUrl && this.loggedIn) {
            this.emitter.logger.info('Performing Logout...');
            const logoutResponse = await requestCall({
                method: this.cfg.logoutMethod,
                url: this.cfg.logoutUrl,
                jar: this.jar,
            });
            this.handleLogoutResponse(logoutResponse);
            this.loggedIn = false;
            this.emitter.logger.info('Logout complete.');
        }
        else {
            this.emitter.logger.info('Nothing to logout');
        }
    }
    addAuthenticationToRequestOptions(requestOptions) {
        requestOptions.jar = this.jar;
    }
    async makeRequest(options) {
        if (!this.loggedIn) {
            await this.login();
        }
        return super.makeRequest(options);
    }
}
exports.CookieRestClient = CookieRestClient;
//# sourceMappingURL=CookieRestClient.js.map