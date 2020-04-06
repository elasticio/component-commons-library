import chai from 'chai';
import sinon from 'sinon';
import { ApiKeyRestClient, Logger } from '../../lib';

import nock = require('nock');
const { expect } = chai;

let options;
let emitter;
const url = '/v2/users';
const baseURL = 'https://resourceServerUrl.com';
const successStatusCode = 200;
const notFoundStatusCode = 404;
const successBody = { result: 'Ok' };
const notFoundBody = 'Not found';
const errNotFound = `Error in making request to ${baseURL} Status code: ${notFoundStatusCode}, Body: "${notFoundBody}"`;
let cfg;

describe('ApiKeyRestClient', () => {
  let client;
  let reqheaders;

  beforeEach(() => {
    options = {
      url,
      method: 'GET',
      body: {},
      headers: {},
    };
    emitter = {
      emit: sinon.spy(),
      logger: Logger.getLogger(),
    };

    cfg = {
      baseURL,
      apiKeyHeaderName: 'apiHeader',
      apiKeyHeaderValue: 'apiKey',
    };

    client = new ApiKeyRestClient(emitter, cfg);
    reqheaders = {
      apiHeader: 'apiKey',
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should succeed makeRequest method, useBaseURLFromConfig: true', async () => {
    nock(baseURL, { reqheaders })
      .get(url)
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result.body).to.be.deep.equal(successBody);
    expect(result.statusCode).to.be.deep.equal(200);
  });

  it('Should succeed makeRequest method, useBaseURLFromConfig: false', async () => {
    options.useBaseURLFromConfig = false;
    options.url = baseURL;
    nock(baseURL, { reqheaders })
      .get('/')
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result.body).to.be.deep.equal(successBody);
    expect(result.statusCode).to.be.deep.equal(200);
  });

  it('Should fail, 400', async () => {
    options.useBaseURLFromConfig = false;
    options.url = baseURL;
    nock(baseURL, { reqheaders })
      .get('/')
      .reply(notFoundStatusCode, notFoundBody);
    await client.makeRequest(options)
      .then(() => {
        throw new Error('Test case does not expect success response');
      })
      .catch((e) => {
        expect(e.message).to.be.equal(errNotFound);
      });
  });
});
