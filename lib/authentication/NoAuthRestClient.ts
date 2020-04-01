/* eslint-disable no-param-reassign,  no-underscore-dangle, class-methods-use-this */
import removeTrailingSlash from 'remove-trailing-slash';
import axios, { AxiosInstance } from 'axios';
import { RequestOptionsType } from "../types";
import { MAX_REDIRECTS_COUNT, REQUEST_MAX_CONTENT_LENGTH, REQUEST_MAX_RETRY, REQUEST_RETRY_DELAY, REQUEST_TIMEOUT } from "../Constants";
import { addRetryCountInterceptorToAxios } from "../helpers";
import { RestResponseType } from "../types/RestResponseType";

export class NoAuthRestClient {
  emitter;
  cfg;

  constructor(emitter, cfg) {
    this.emitter = emitter;
    this.cfg = cfg;
  }

  public replaceDefaultResponseHandler(responseHandler) {
    this.handleRestResponse = responseHandler;
  }

  // @ts-ignore: no-unused-variable
  protected async addAuthenticationToRequestOptions(requestOptions) {
  }

  async makeRequest(options: RequestOptionsType) {
    const requestOptions: RequestOptionsType = {
      ...{
        rebound: false,
        maxRedirects: MAX_REDIRECTS_COUNT,
        gzip: false, //TODO Implement gzip decompress feature,
        useBaseURLFromConfig: true,
        maxContentLength: REQUEST_MAX_CONTENT_LENGTH,
        validateStatus:  () => {
          return true;
        },
        timeout: REQUEST_TIMEOUT
      }, ...options
    };

    if (options.useBaseURLFromConfig) {
      requestOptions.baseURL = this.cfg.baseURL;
    }
    if (requestOptions.baseURL) {
      requestOptions.baseURL = removeTrailingSlash(requestOptions.baseURL.trim());
    }
    const client = axios.create();
    this.addRebound(requestOptions, client)

    this.emitter.logger.info(`Making ${requestOptions.method} request to ${requestOptions.url}`);
    this.emitter.logger.trace('Request options: %j', requestOptions);

    await this.addAuthenticationToRequestOptions(requestOptions);
    const response = await axios(requestOptions);

    return this.handleRestResponse(response);
  }

  private addRebound(requestOptions: RequestOptionsType, client: AxiosInstance) {
    if (requestOptions.rebound) {
      requestOptions.retry = REQUEST_MAX_RETRY;
      requestOptions.delay = REQUEST_RETRY_DELAY;
      addRetryCountInterceptorToAxios(client);
    }
  }

  protected handleRestResponse(response) {
    const { status: statusCode, statusText, headers, data: body, config } = response;
    const responseObj: RestResponseType = {
      statusCode,
      statusText,
      headers,
      body,
    };
    this.emitter.logger.trace(`Response statusCode: ${statusCode}, statusText: ${statusText} body: %j, headers: %j`, body, headers);
    if (statusCode >= 400) {
      throw new Error(`Error in making request to ${response.request.uri.href} Status code: ${statusCode}, Body: ${JSON.stringify(body)}`);
    }
    if (statusCode >= 300 && config.maxRedirects>0) {
      responseObj.statusText = 'Redirection error. Please enable redirect mode if You need to support redirecting in the request.';
      if (!this.cfg.dontThrowError) {
        const err = new Error(JSON.stringify(responseObj));
        err.name = 'HTTP redirection error';
        throw err;
      }
    }
    return responseObj;
  }
}
