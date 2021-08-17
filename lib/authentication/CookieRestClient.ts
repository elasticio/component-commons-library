/* eslint-disable no-param-reassign,  no-underscore-dangle, class-methods-use-this */
import axios, { AxiosInstance } from 'axios';
import querystring from 'querystring';
import toughCookie, { CookieJar } from 'tough-cookie';
import { NoAuthRestClient } from './NoAuthRestClient';

export class CookieRestClient extends NoAuthRestClient {
  loggedIn: boolean;
  jar: CookieJar;
  requestCall: AxiosInstance;

  constructor(emitter, cfg) {
    super(emitter, cfg);
    this.jar = new toughCookie.CookieJar();
    this.loggedIn = false;
    this.requestCall = axios.create();
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
    const loginResponse = await this.requestCall({
      method: 'POST',
      url: this.cfg.loginUrl,
      data: querystring.stringify({
        username: this.cfg.username,
        password: this.cfg.password,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      withCredentials: true,
    });

    loginResponse.headers['set-cookie']
      .forEach(async (cookie) => { await this.jar.setCookie(cookie, loginResponse.config.url!); });

    this.handleLoginResponse(loginResponse);
    this.loggedIn = true;
    this.emitter.logger.info('Login Complete.');
  }

  async logout() {
    if (this.cfg.logoutUrl && this.loggedIn) {
      this.emitter.logger.info('Performing Logout...');
      const logoutResponse = await this.requestCall({
        method: this.cfg.logoutMethod,
        url: this.cfg.logoutUrl,
        withCredentials: true,
        headers: {
          Cookie: await this.jar.getCookieString(this.cfg.logoutUrl),
        },
      });
      this.handleLogoutResponse(logoutResponse);
      this.loggedIn = false;
      this.emitter.logger.info('Logout complete.');
    } else {
      this.emitter.logger.info('Nothing to logout');
    }
  }

  protected async addAuthenticationToRequestOptions(requestOptions) {
    if (!requestOptions.headers) requestOptions.headers = {};
    requestOptions.headers.Cookie = await this.jar.getCookieString(requestOptions.url);
    requestOptions.withCredentials = true;
  }

  async makeRequest(options) {
    if (!this.loggedIn) {
      await this.login();
    }
    return super.makeRequest(options);
  }
}
