/* eslint-disable no-param-reassign,  no-underscore-dangle, class-methods-use-this */
import { promisify } from 'util';
const request = promisify(require('request'));
import removeTrailingSlash from 'remove-trailing-slash';
import removeLeadingSlash from 'remove-leading-slash';

export class NoAuthRestClient {
  emitter;
  cfg;

  constructor(emitter, cfg) {
    this.emitter = emitter;
    this.cfg = cfg;
  }

  // @ts-ignore: no-unused-variable
  protected addAuthenticationToRequestOptions(requestOptions) {
  }

  protected handleRestResponse(response) {
    if (response.statusCode >= 400) {
      throw new Error(`Error in making request to ${response.request.uri.href} Status code: ${response.statusCode}, Body: ${JSON.stringify(response.body)}`);
    }

    this.emitter.logger.trace(`Response statusCode: ${response.statusCode}, body: %j`, response.body);
    return response.body;
  }

  // options expects the following sub-variables:
  //    url: Url to call
  //    method: HTTP verb to use
  //    body: Body of the request, if applicable. Defaults to undefined.
  //    headers: Any HTTP headers to add to the request. Defaults to {}
  //    urlIsSegment: Whether to append to the base server url or
  //    if the provided URL is an absolute path. Defaults to true
  //    responseHandler: function to modify given response, takes response and
  //      default handleResponseRequest as parameters. If not defined, standard
  //      handleRestResponse is used
  async makeRequest(options) {
    const {
      url, method, body, headers = {}, urlIsSegment = true, isJson = true, responseHandler,
    } = options;
    const urlToCall = urlIsSegment
      ? `${removeTrailingSlash(this.cfg.resourceServerUrl.trim())}/${removeLeadingSlash(url.trim())}` // Trim trailing or leading '/'
      : url.trim();

    this.emitter.logger.trace(`Making ${method} request to ${urlToCall} with body: %j ...`, body);

    const requestOptions = {
      method,
      body,
      headers,
      url: urlToCall,
      json: isJson,
    };

    // eslint-disable-next-line no-underscore-dangle
    await this.addAuthenticationToRequestOptions(requestOptions);

    const response = await request(requestOptions);

    if (responseHandler) {
      return responseHandler(response, this.handleRestResponse);
    }

    return this.handleRestResponse(response);
  }
}
