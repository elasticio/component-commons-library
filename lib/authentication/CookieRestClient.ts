/* eslint-disable no-param-reassign,  no-underscore-dangle, class-methods-use-this */
import request from 'request';
import requestPromise from 'request-promise';
import { NoAuthRestClient } from './NoAuthRestClient';

export class CookieRestClient extends NoAuthRestClient {
  loggedIn: boolean;

  jar: any;

  constructor(emitter, cfg) {
    super(emitter, cfg);
    this.jar = request.jar();
    this.loggedIn = false;
  }

  private basicResponseCheck(response) {
    if (response.statusCode >= 400) {
      throw new Error(`Error in authentication.  Status code: ${response.statusCode}, Body: ${JSON.stringify(response.body)}`);
    }
  }

  protected handleLoginResponse(response) {
    this.basicResponseCheck(response);
  }

  protected handleLogoutResponse(response) {
    this.basicResponseCheck(response);
  }

  async login() {
    this.logger.info('Performing Login ...');
    const loginResponse = await requestPromise({
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
      resolveWithFullResponse: true,
      simple: false,
    });
    this.handleLoginResponse(loginResponse);
    this.loggedIn = true;
    this.logger.info('Login Complete.');
  }

  async logout() {
    if (this.cfg.logoutUrl && this.loggedIn) {
      this.logger.info('Performing Logout...');
      const logoutResponse = await requestPromise({
        method: this.cfg.logoutMethod,
        url: this.cfg.logoutUrl,
        jar: this.jar,
        resolveWithFullResponse: true,
        simple: false,
      });
      this.handleLogoutResponse(logoutResponse);
      this.loggedIn = false;
      this.logger.info('Logout complete.');
    } else {
      this.logger.info('Nothing to logout');
    }
  }

  protected async addAuthenticationToRequestOptions(requestOptions) {
    requestOptions.jar = this.jar;
  }

  async makeRequest(options) {
    if (!this.loggedIn) {
      await this.login();
    }
    return super.makeRequest(options);
  }
}
