/* eslint-disable no-param-reassign,  no-underscore-dangle, class-methods-use-this */
import requestPromise from 'request-promise';
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
  async makeRequest(options) {
    const {
      url,
      urlIsSegment = true,
      method,
      headers = {},
      body,
      isJson = true,
      followRedirect = false,
      followAllRedirects = false,
      encoding,
      gzip = false,
      resolveWithFullResponse = true,
      simple = false,
    } = options;
    const urlToCall = urlIsSegment
        ? `${removeTrailingSlash(this.cfg.resourceServerUrl.trim())}/${removeLeadingSlash(url.trim())}` // Trim trailing or leading '/'
        : url.trim();
    this.emitter.logger.trace(`Making ${method} request to ${urlToCall} with body: %j ...`, body);
    const requestOptions = {
      method,
      headers,
      body,
      followRedirect,
      followAllRedirects,
      gzip,
      resolveWithFullResponse,
      simple,
      encoding,
      json: isJson,
      url: urlToCall,
    };
    // eslint-disable-next-line no-underscore-dangle
    await this.addAuthenticationToRequestOptions(requestOptions);
    const response = await requestPromise(requestOptions);
    return this.handleRestResponse(response);
  }
}
