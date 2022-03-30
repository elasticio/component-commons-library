/* eslint-disable no-param-reassign,  no-underscore-dangle, class-methods-use-this */
import { promisify } from 'util';
import request from 'request';
import { NoAuthRestClient } from './NoAuthRestClient';

const requestCall = promisify(request);

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
    } else {
      this.emitter.logger.info('Nothing to logout');
    }
  }

  protected addAuthenticationToRequestOptions(requestOptions) {
    requestOptions.jar = this.jar;
  }

  async makeRequest(options) {
    if (!this.loggedIn) {
      await this.login();
    }
    return super.makeRequest(options);
  }
}
