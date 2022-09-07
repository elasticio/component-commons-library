import http from 'http';
import https from 'https';
import axios, { AxiosInstance } from 'axios';
import removeTrailingSlash from 'remove-trailing-slash';
import removeLeadingSlash from 'remove-leading-slash';
import { axiosReqWithRetryOnServerError, getErrMsg, getFacelessRetriesCount } from '../externalApi';
import { PlatformApiLogicClient } from '../platformApi/PlatformApiLogicClient';

export class FacelessRestClient {
  emitter;

  cfg;

  request;

  private readonly axiosInst: AxiosInstance;

  private accessToken: null;

  logger: any;

  platformClient: PlatformApiLogicClient;

  constructor(emitter, cfg, userAgent?: string, msgId?: string) {
    this.emitter = emitter;
    this.cfg = cfg;
    this.axiosInst = axios.create({
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true }),
    });
    this.cfg.resourceServerUrl = cfg.resourceServerUrl;
    this.accessToken = null;
    this.logger = emitter.logger;
    this.platformClient = new PlatformApiLogicClient(emitter, cfg, userAgent, msgId);
  }

  protected async addAuthenticationToRequestOptions(requestOptions) {
    if (!this.accessToken) {
      const { secretId } = this.cfg;
      if (secretId) {
        this.logger.debug('Fetching credentials by secretId');
        const secret = await this.platformClient.fetchSecretById({ secretId });
        this.accessToken = secret.attributes.credentials.access_token;
      } else {
        this.logger.debug('Fetching credentials from this.cfg');
        this.accessToken = this.cfg.oauth.access_token;
      }
    }
    // eslint-disable-next-line no-param-reassign
    requestOptions.headers.Authorization = `Bearer ${this.accessToken}`;
  }

  // options expects the following sub-variables:
  //    url: Url to call
  //    method: HTTP verb to use
  //    body: Body of the request, if applicable. Defaults to undefined.
  //    headers: Any HTTP headers to add to the request. Defaults to {}
  //    urlIsSegment: Whether to append to the base server url or
  //    if the provided URL is an absolute path. Defaults to true
  async makeRequest(options) {
    const {
      url, method, body, headers = {}, urlIsSegment = true,
    } = options;
    const urlToCall = urlIsSegment
      ? `${removeTrailingSlash(this.cfg.resourceServerUrl.trim())}/${removeLeadingSlash(url.trim())}` // Trim trailing or leading '/'
      : url.trim();

    this.logger.debug(`Making ${method} request...`);

    const requestOptions = {
      method,
      url: urlToCall,
      data: body,
      headers,
    };

    let error;
    let currentRetry = 0;
    const facelessRetriesCount = getFacelessRetriesCount();
    while (currentRetry < facelessRetriesCount) {
      await this.addAuthenticationToRequestOptions(requestOptions);
      try {
        const response = await axiosReqWithRetryOnServerError.call(this, requestOptions, this.axiosInst);
        return response;
      } catch (err) {
        this.logger.error(getErrMsg(err.response));
        error = err;
        if (err.response?.status < 500 && err.response?.status !== 401) {
          throw err;
        }
        this.logger.info(`Request failed, faceless retrying(${1 + currentRetry})`);
        this.accessToken = null;
        currentRetry++;
      }
    }
    this.logger.error('The number of attempts to receive the proper token has been exhausted.');
    throw error;
  }
}
