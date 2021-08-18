/* eslint-disable no-param-reassign,  no-underscore-dangle, class-methods-use-this */
import axios from 'axios';
import http from 'http';
import https from 'https';
import removeTrailingSlash from 'remove-trailing-slash';
import removeLeadingSlash from 'remove-leading-slash';

export class NoAuthRestClient {
  emitter;
  cfg;
  request;

  constructor(emitter, cfg) {
    this.emitter = emitter;
    this.cfg = cfg;
    this.request = axios.create({
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true }),
    });
  }

  // @ts-ignore: no-unused-variable
  protected addAuthenticationToRequestOptions(requestOptions) {
  }

  protected handleRestResponse(response) {
    if (response.statusCode >= 400) {
      throw new Error(`Error in making request to ${response.config.url}/ Status code: ${response.statusCode}, Body: ${JSON.stringify(response.body)}`);
    }

    this.emitter.logger.debug(`Response statusCode: ${response.statusCode}`);
    return response.body;
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
      url, method, body, headers = {}, urlIsSegment = true, isJson = true, responseHandler, axiosOptions = {},
    } = options;
    const urlToCall = urlIsSegment
      ? `${removeTrailingSlash(this.cfg.resourceServerUrl.trim())}/${removeLeadingSlash(url.trim())}` // Trim trailing or leading '/'
      : url.trim();

    this.emitter.logger.debug(`Making ${method} request...`);

    const requestOptions = {
      ...axiosOptions,
      method,
      headers,
      data: body,
      url: urlToCall,
    };
    if (isJson) requestOptions.headers['Content-type'] = 'application/json';

    // eslint-disable-next-line no-underscore-dangle
    await this.addAuthenticationToRequestOptions(requestOptions);

    let response;
    try {
      response = await this.request(requestOptions);
    } catch (err) {
      response = err.response || err;
    }
    response.body = response.data;
    response.statusCode = response.status;

    if (responseHandler) {
      return responseHandler(response, this.handleRestResponse.bind(this));
    }

    return this.handleRestResponse(response);
  }
}
