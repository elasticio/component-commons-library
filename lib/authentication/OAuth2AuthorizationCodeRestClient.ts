import requestPromise from 'request-promise';
import { NoAuthRestClient } from './NoAuthRestClient';

export class OAuth2RestClient extends NoAuthRestClient {
  private async fetchNewToken() {
    this.logger.info('Fetching new token...');
    const authTokenResponse = await requestPromise({
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

    this.logger.info('New token fetched...');
    this.logger.debug('New token: %j', authTokenResponse);

    if (authTokenResponse.statusCode >= 400) {
      throw new Error(`Error in authentication.  Status code: ${authTokenResponse.statusCode}, Body: ${JSON.stringify(authTokenResponse.body)}`);
    }

    return authTokenResponse.body;
  }

  private async getValidToken() {
    if (!this.cfg.oauth2) {
      throw new Error('cfg.oauth2 can not be empty');
    }
    const tokenExpiryTime = new Date(this.cfg.oauth2.tokenExpiryTime);
    const now = new Date();
    if (now < tokenExpiryTime) {
      this.logger.info('Previously valid token found.');
      return this.cfg.oauth2.access_token;
    }

    const tokenRefreshStartTime = new Date();
    this.cfg.oauth2 = await this.fetchNewToken();
    this.cfg.oauth2.tokenExpiryTime = (new Date(tokenRefreshStartTime.getTime()
      + (this.cfg.oauth2.expires_in * 1000))).toISOString();
    if (this.emit) {
      this.emit('updateKeys', this.cfg.oauth2);
    }
    return this.cfg.oauth2.access_token;
  }

  protected async addAuthenticationToRequestOptions(requestOptions) {
    const accessToken = await this.getValidToken();
    requestOptions.headers.Authorization = `Bearer ${accessToken}`;
  }
}
