/* eslint-disable no-param-reassign,  no-underscore-dangle, class-methods-use-this */
import requestPromise from 'request-promise';
import removeTrailingSlash from 'remove-trailing-slash';
import removeLeadingSlash from 'remove-leading-slash';

export class NoAuthRestClient {
  emitter;
  cfg;
  responseHandler;

  constructor(emitter, cfg) {
    this.emitter = emitter;
    this.cfg = cfg;
  }

  protected registerResponseHandler(responseHandler) {
    this.responseHandler = responseHandler;
  }

  // @ts-ignore: no-unused-variable
  protected async addAuthenticationToRequestOptions(requestOptions) {
  }

  protected handleRestResponse(response) {
    const { statusCode, headers, body } = response;
    const responseObj: any = {
      statusCode,
      headers,
      body,
    };
    this.emitter.logger.trace(`Response statusCode: ${response.statusCode}, body: %j, headers: %j`, response.body, response.headers);
    if (response.statusCode >= 400) {
      throw new Error(`Error in making request to ${response.request.uri.href} Status code: ${statusCode}, Body: ${JSON.stringify(body)}`);
    }
    if (statusCode >= 300 && this.cfg.followRedirect) {
      responseObj.statusMessage = 'Redirection error. Please enable redirect mode if You need to support redirecting in the request.';
      if (!this.cfg.dontThrowError) {
        const err = new Error(JSON.stringify(responseObj));
        err.name = 'HTTP redirection error';
        throw err;
      }
    }
    return responseObj;
  }

  // options expects the following sub-variables:
  //    url: Url to call
  //    method: HTTP verb to use
  //    body: Body of the request, if applicable. Defaults to undefined.
  //    headers: Any HTTP headers to add to the request. Defaults to {}
  //    urlIsSegment: Whether to append to the base server url or
  //    if the provided URL is an absolute path. Defaults to true
  async makeRequest(options) {
    const requestOptions: any = {
      urlIsSegment: true,
      headers: Headers,
      followRedirect: false,
      followAllRedirects: false,
      gzip: false,
      resolveWithFullResponse: true,
      simple: false,
    };
    Object.assign(requestOptions, options);

    requestOptions.json = options.isJson ?? options.json ?? true;
    requestOptions.url = requestOptions.urlIsSegment
      ? `${removeTrailingSlash(this.cfg.resourceServerUrl.trim())}/${removeLeadingSlash(requestOptions.url.trim())}` // Trim trailing or leading '/'
      : requestOptions.url.trim();
    this.emitter.logger.trace(`Making ${requestOptions.method} request to ${requestOptions.url} with body: %j ...`, requestOptions.body);

    await this.addAuthenticationToRequestOptions(requestOptions);
    const response = await requestPromise(requestOptions);
    if (this.responseHandler) {
      return this.responseHandler(response);
    }
    return this.handleRestResponse(response);
  }
}
