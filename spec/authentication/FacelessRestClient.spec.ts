import chai from 'chai';
import nock from 'nock';
import sinon from 'sinon';
import { Logger, FacelessRestClient } from '../../src';

const { expect } = chai;

let options;
let emitter;
const url = 'https://example.com';
const resourceServerUrl = 'https://resourceServerUrl.com';
const successStatusCode = 200;
const notFoundStatusCode = 404;
const successBody = 'Ok';
const notFoundBody = 'Not found';
const errNotFound = `Got error "unknown", status - "${notFoundStatusCode}", body: "${notFoundBody}"`;
const secretId = 'secretId';
const cfg = {
  resourceServerUrl,
  secretId,
  authorizationServerTokenEndpointUrl: 'https://some.url',
  oauth2_field_client_id: 'some_key',
  oauth2_field_client_secret: 'some_secret',
};
const secret = {
  data: {
    attributes: {
      credentials: {
        access_token: 'accessToken',
      },
    },
  },
};
process.env.ELASTICIO_API_URI = 'https://app.example.io';
process.env.ELASTICIO_API_USERNAME = 'user';
process.env.ELASTICIO_API_KEY = 'apiKey';
process.env.ELASTICIO_WORKSPACE_ID = 'workspaceId';

describe('FacelessRestClient', () => {
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
    nock(process.env.ELASTICIO_API_URI)
      .get(`/v2/workspaces/${process.env.ELASTICIO_WORKSPACE_ID}/secrets/${secretId}`)
      .reply(200, secret);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should succeed, urlIsSegment: true', async () => {
    const client = new FacelessRestClient(emitter, cfg);
    nock(resourceServerUrl)
      .get(`/${url}`)
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result).to.be.deep.equal(successBody);
  });

  it('Should succeed, urlIsSegment: false', async () => {
    const client = new FacelessRestClient(emitter, cfg);
    options.urlIsSegment = false;
    nock(url)
      .get('/')
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result).to.be.deep.equal(successBody);
  });

  it('Should fail, 404', async () => {
    const client = new FacelessRestClient(emitter, cfg);
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

  it('Test makeRequest with expired access_token', async () => {
    const expiredTokenNock = nock(url)
      .get('/')
      .reply(401)
      .get('/')
      .reply(successStatusCode, successBody);
    nock(process.env.ELASTICIO_API_URI)
      .get(`/v2/workspaces/${process.env.ELASTICIO_WORKSPACE_ID}/secrets/${secretId}`)
      .reply(200, secret);
    const clientExpiredToken = new FacelessRestClient(emitter, cfg);
    options.urlIsSegment = false;
    const result = await clientExpiredToken.makeRequest(options);
    expect(result).to.be.deep.equal(successBody);
    expect(expiredTokenNock.isDone()).to.be.equal(true);
  });
});
