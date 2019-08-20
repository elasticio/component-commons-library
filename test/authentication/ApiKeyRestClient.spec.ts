// import bunyan from 'bunyan';
import chai from 'chai';
import nock from 'nock';
import sinon from 'sinon';

const { expect } = chai;
import { ApiKeyRestClient, Logger } from '../../lib';

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
      resourceServerUrl,
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

  it('Should succeed makeRequest method, urlIsSegment: false', async () => {
    options.urlIsSegment = false;
    nock(url, { reqheaders })
      .get('/')
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result).to.be.deep.equal(successBody);
  });

  it('Should succeed makeRequest method, urlIsSegment: true', async () => {
    nock(resourceServerUrl, { reqheaders })
      .get(`/${url}`)
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result).to.be.deep.equal(successBody);
  });

  it('Should fail, 400', async () => {
    options.urlIsSegment = false;
    nock(url, { reqheaders })
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
