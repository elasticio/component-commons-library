import chai from 'chai';
import sinon from 'sinon';
import { Logger, NoAuthRestClient } from '../../lib';

import nock = require('nock');

const { expect } = chai;

const url = 'v2/user';
const baseURL = 'http://www.example.io/';
const successBody = { result: 'ok' };
const successStatusCode = 200;
const notFoundStatusCode = 404;
const notFoundBody = 'Not found';
const cfg = { baseURL };

describe('NoAuthRestClient', () => {
  let options;
  let emitter;

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
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should succeed, urlIsSegment: true', async () => {
    nock(baseURL)
      .get(`/${url}`)
      .reply(successStatusCode, successBody);
    const client = new NoAuthRestClient(emitter, cfg);
    const result = await client.makeRequest(options);
    expect(result.body).to.be.deep.equal(successBody);
  });

  it('Should succeed, urlIsSegment: false', async () => {
    const client = new NoAuthRestClient(emitter, cfg);
    options.url = baseURL;
    options.useBaseURLFromConfig = false;
    nock(baseURL)
      .get('/')
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result.body).to.be.deep.equal(successBody);
  });

  it('Should fail, 404', async () => {
    const client = new NoAuthRestClient(emitter, cfg);
    options.url = baseURL;
    options.useBaseURLFromConfig = false;
    nock(baseURL)
      .get('/')
      .reply(notFoundStatusCode, notFoundBody);
    const errNotFound = `Error in making request to ${options.url} Status code: ${notFoundStatusCode}, Body: "${notFoundBody}"`;
    await client.makeRequest(options)
      .then(() => {
        throw new Error('Test case does not expect success response');
      })
      .catch((e) => {
        expect(e.message).to.be.equal(errNotFound);
      });
  });
});
