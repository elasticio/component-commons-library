"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NoAuthRestClient_1 = require("./NoAuthRestClient");
const { promisify } = require('util');
const request = promisify(require('request'));
class OAuth2RestClient extends NoAuthRestClient_1.NoAuthRestClient {
    async fetchNewToken() {
        this.emitter.logger.info('Fetching new token...');
        const authTokenResponse = await request({
            uri: this.cfg.authorizationServerTokenEndpointUrl,
            method: 'POST',
            json: true,
            simple: false,
            resolveWithFullResponse: true,
            form: {
                refresh_token: this.cfg.oauth2.refresh_token,
                scope: this.cfg.oauth2.scope,
                grant_type: 'refresh_token',
                client_id: this.cfg.oauth2_field_client_id,
                client_secret: this.cfg.oauth2_field_client_secret,
            },
        });
        this.emitter.logger.info('New token fetched...');
        this.emitter.logger.debug('New token: %j', authTokenResponse);
        if (authTokenResponse.statusCode >= 400) {
            throw new Error(`Error in authentication.  Status code: ${authTokenResponse.statusCode}, Body: ${JSON.stringify(authTokenResponse.body)}`);
        }
        return authTokenResponse.body;
    }
    async getValidToken() {
        if (!this.cfg.oauth2) {
            throw new Error('cfg.oauth2 can not be empty');
        }
        const tokenExpiryTime = new Date(this.cfg.oauth2.tokenExpiryTime);
        const now = new Date();
        if (now < tokenExpiryTime) {
            this.emitter.logger.info('Previously valid token found.');
            return this.cfg.oauth2.access_token;
        }
        const tokenRefreshStartTime = new Date();
        this.cfg.oauth2 = await this.fetchNewToken();
        this.cfg.oauth2.tokenExpiryTime = (new Date(tokenRefreshStartTime.getTime()
            + (this.cfg.oauth2.expires_in * 1000))).toISOString();
        if (this.emitter && this.emitter.emit) {
            this.emitter.emit('updateKeys', this.cfg.oauth2);
        }
        return this.cfg.oauth2.access_token;
    }
    async addAuthenticationToRequestOptions(requestOptions) {
        const accessToken = await this.getValidToken();
        requestOptions.headers.Authorization = `Bearer ${accessToken}`;
    }
}
exports.OAuth2RestClient = OAuth2RestClient;
//# sourceMappingURL=OAuth2AuthorizationCodeRestClient.js.map