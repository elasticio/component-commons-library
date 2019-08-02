import chai from 'chai';
import nock from 'nock';
import sinon from 'sinon';

const { expect } = chai;
import { BasicAuthRestClient, Logger } from '../../lib';

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

describe('BasicAuthRestClient', () => {
  const user = 'user';
  const pass = 'pass';
  let client;
  const basicAuthOptions = { user, pass };

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
      username: user,
      password: pass,
    };

    client = new BasicAuthRestClient(emitter, cfg);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should succeed makeRequest method, urlIsSegment: false', async () => {
    options.urlIsSegment = false;
    nock(url)
      .get('/')
      .basicAuth(basicAuthOptions)
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result).to.be.deep.equal(successBody);
  });

  it('Should succeed makeRequest method, urlIsSegment: true', async () => {
    nock(resourceServerUrl)
      .get(`/${url}`)
      .basicAuth(basicAuthOptions)
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result).to.be.deep.equal(successBody);
  });

  it('Should fail, 400', async () => {
    options.urlIsSegment = false;
    nock(url)
      .get('/')
      .basicAuth(basicAuthOptions)
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
