import { promisify } from 'util';
const { messages } = require('elasticio-node');
const request = promisify(require('request'));
import removeTrailingSlash from 'remove-trailing-slash';
import removeLeadingSlash from 'remove-leading-slash';
const xml2js = require('xml2js-es6-promise');
const uuidv1 = require('uuid/v1');

const { AttachmentProcessor } = require('../attachment/AttachmentProcessor');

const HTTP_ERROR_CODE_REBOUND = new Set([408, 423, 429, 500, 502, 503, 504]);

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

  // options expects the following sub-variables:
  //    url: Url to call
  //    method: HTTP verb to use
  //    body: Body of the request, if applicable. Defaults to undefined.
  //    headers: Any HTTP headers to add to the request. Defaults to {}
  //    urlIsSegment: Whether to append to the base server url or
  //    if the provided URL is an absolute path. Defaults to true
  async makeRequest(options) {
    const {
      url, method, body, headers = {}, urlIsSegment = true, isJson = true,
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

    await this.addAuthenticationToRequestOptions(requestOptions);

    const response = await request(requestOptions);
    response.body = response.body === Object(response.body)
      ? JSON.stringify(response.body)
      : response.body;

    return response;
  }

  protected async processResponse(response, msg) {
    this.emitter.logger.trace('HTTP Response headers: %j', response.headers);
    this.emitter.logger.trace('HTTP Response body: %o', response.body.toString('utf8'));

    if (response.body && response.body.byteLength === 0) {
      return this.buildResponseStructure(response, {});
    }

    const contType = response.headers['content-type'];

    this.emitter.logger.info('Content type: %o', contType);
    if (contType) {
      if (contType.includes('json')) {
        return this.buildResponseStructure(response, JSON.parse(response.body));
      }
      if (contType.includes('xml')) {
        this.emitter.logger.info('trying to parse as XML');
        const parseOptions = {
          trim: false,
          normalize: false,
          explicitArray: false,
          normalizeTags: false,
          attrkey: '_attr',
          tagNameProcessors: [
            name => name.replace(':', '-'),
          ],
        };
        const jsonXml = await xml2js(response.body, parseOptions);
        const responseStructure = this.buildResponseStructure(response, jsonXml);
        this.emitter.logger.info('successfully parsed');
        return responseStructure;
      }
      if (contType.includes('image') || contType.includes('msword')
        || contType.includes('msexcel') || contType.includes('pdf')
        || contType.includes('csv') || contType.includes('octet-stream')) {
        const uploadResult = await new AttachmentProcessor().uploadAttachment(response.body);

        const name = `${uuidv1()}_${new Date().getTime()}`;
        msg.attachments = {};
        msg.attachments[name] = {
          url: uploadResult.get_url,
          size: response.headers['content-length'],
          'content-type': contType,
        };
        console.log(
          `binary data with ${JSON.stringify(msg.attachments)} successfully saved to attachments`,
        );
        return {};
      }
      return this.buildResponseStructure(response, response.body.toString('utf8'));
    }

    this.emitter.logger.info('Unknown content-type received. trying to parse as JSON');
    try {
      return this.buildResponseStructure(response, JSON.parse(response.body));
    } catch (e) {
      this.emitter.logger.error(
        'Parsing to JSON object is failed. Error: %o. Returning response as is',
        e,
      );
      return this.buildResponseStructure(response, response.body.toString('utf8'));
    }
  }

  /*
    * return new output structure only if dontThrowErrorFlg is true
    *
    * New structure requirements:
    *
    * The outbound message body should include the HTTP response body from the REST call.
    * The message payload should include a headers section with
    * all of the headers received from the REST call.
    * The HTTP status code should also be included in the message payload.
    *
    * else return body of response
    */
  buildResponseStructure(response, body) {
    if (this.cfg.dontThrowErrorFlg) {
      return {
        body,
        headers: response.headers,
        statusCode: response.statusCode,
        statusMessage: response.statusMessage,
      };
    }
    return body;
  }

  async buildResultMessage(result, msg) {
    this.emitter.logger.trace('Request output: %j', result);

    if (!msg || !msg.attachments) {
      // tslint:disable-next-line no-parameter-reassignment
      msg = { attachments: {} };
    }

    if (this.cfg.splitResult && Array.isArray(result)) {
      // Walk through chain of promises: https://stackoverflow.com/questions/30445543/execute-native-js-promise-in-series
      for (const item of result) {
        const output = messages.newMessageWithBody(item);
        output.attachments = msg.attachments;
        await this.emitter.emit('data', output);
      }
      await this.emitter.emit('end');
    } else {
      const output = messages.newMessageWithBody(result);
      output.attachments = msg.attachments;
      return output;
    }
  }

  /*
  * https://user-images.githubusercontent.com/13310949/41960520-9bd468ca-79f8-11e8-83f4-d9b2096deb6d.png
  * */
  async checkErrors(response) {
    const { statusCode } = response;
    this.emitter.logger.info('Response statusCode %d', statusCode);
    if (statusCode >= 200 && statusCode < 300) {
      return response;
    }
    if (statusCode >= 300 && statusCode < 400) {
      if (this.cfg.followRedirect) {
        const REDIRECTION_ERROR = `${response.statusMessage
        || 'Redirection error.'} Please check "Follow redirect mode" if You want to use redirection in your request.`;
        if (this.cfg.dontThrowErrorFlg) {
          return {
            statusCode,
            statusMessage: REDIRECTION_ERROR,
            headers: response.headers,
            body: response.body,
          };
        }
        const err = new Error(
          `Code: ${statusCode} Headers: ${JSON.stringify(
            response.headers,
          )} Body: ${JSON.stringify(
            response.body,
          )}. Error Message: ${REDIRECTION_ERROR}`,
        );
        err['code'] = statusCode;
        err['name'] = 'HTTP error';
        throw err;
      }
      return response;
    } if (statusCode >= 400 && statusCode < 1000) {
      if (this.cfg.dontThrowErrorFlg) {
        return {
          statusCode,
          headers: response.headers,
          body: response.body,
          statusMessage: `${response.statusMessage || 'HTTP error.'}`,
        };
      }
      const err = new Error(
        `Code: ${statusCode} Message: ${response.statusMessage
        || 'HTTP error'}`,
      );
      err['code'] = statusCode;
      err['name'] = 'HTTP error';
      err['body'] = response.body.toString('utf8');
      throw err;
    }
  }

  async buildErrorStructure(e) {
    if (this.cfg.enableRebound && (HTTP_ERROR_CODE_REBOUND.has(e.code)
      || e.message.includes('DNS lookup timeout'))) {
      this.emitter.logger.info('Component error: %o', e);
      this.emitter.logger.info('Starting rebound');
      this.emitter.emit('rebound', e.message);
      this.emitter.emit('end');
    } else {
      if (this.cfg.dontThrowErrorFlg) {
        const output = {
          errorCode: e.code,
          errorMessage: e.message,
          errorStack: e.stack,
        };
        this.emitter.logger.debug('Component output: %o', output);
        return messages.newMessageWithBody(output);
      }
      this.emitter.logger.error('Component error: %o', e);
      throw e;
    }
  }
}
