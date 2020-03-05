// import bunyan from 'bunyan';
import chai from 'chai';
import nock from 'nock';
import sinon from 'sinon';

const { expect } = chai;
import { NtlmRestClient, Logger } from '../../lib';

let options;
let emitter;
const url = 'https://example.com';
const resourceServerUrl = 'https://resourceServerUrl.com';
const successStatusCode = 200;
const notFoundStatusCode = 404;
const successBody = 'Ok';
const notFoundBody = 'Not found';
const errNotFound = `Error in making request to ${url}/ Status code: ${notFoundStatusCode}, Body: "${notFoundBody}"`;
let cfg;

describe('NtlmRestClient', () => {
  let client;

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
      resourceServerUrl,
      username: 'ntlmUsername',
      password: 'ntlmPassword',
    };

    client = new NtlmRestClient(emitter, cfg);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should succeed makeRequest method, urlIsSegment: false', async () => {
    options.urlIsSegment = false;
    nock(url)
      .get('/')
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result).to.be.deep.equal(successBody);
  });

  it('Should succeed makeRequest method, urlIsSegment: true', async () => {
    nock(resourceServerUrl)
      .get(`/${url}`)
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result).to.be.deep.equal(successBody);
  });

  it('Should fail, 400', async () => {
    options.urlIsSegment = false;
    nock(url)
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
