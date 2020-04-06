import chai from 'chai';
import sinon from 'sinon';
import { Logger, OAuth2RestClient } from '../../lib';

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
const cfg = {
  baseURL,
  oauth2: {
    refresh_token: 'some_token',
    scope: [
      'SOME_SCOPE',
    ],
    expires_in: 3599,
    access_token: 'some_token',
    tokenExpiryTime: (new Date(new Date().getTime() + 10000)).toISOString(),
  },
  authorizationServerTokenEndpointUrl: 'https://some.url',
  oauth2_field_client_id: 'some_key',
  oauth2_field_client_secret: 'some_secret',
};

describe('OAuth2AuthorizationCodeRestClient', () => {
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

  it('Should succeed, useBaseURLFromConfig: true', async () => {
    const client = new OAuth2RestClient(emitter, cfg);
    nock(cfg.authorizationServerTokenEndpointUrl)
      .post('/')
      .reply(200, cfg.oauth2);
    nock(baseURL)
      .get(url)
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result.body).to.be.deep.equal(successBody);
    expect(result.statusCode).to.be.deep.equal(200);
    expect(emitter.emit.withArgs('updateKeys').callCount).to.be.equal(0);
  });

  it('Should succeed, useBaseURLFromConfig: false', async () => {
    const client = new OAuth2RestClient(emitter, cfg);
    options.useBaseURLFromConfig = false;
    options.url = baseURL;
    nock(baseURL)
      .get('/')
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result.body).to.be.deep.equal(successBody);
    expect(result.statusCode).to.be.deep.equal(200);
    expect(emitter.emit.withArgs('updateKeys').callCount).to.be.equal(0);
  });

  it('Should fail, 404', async () => {
    const client = new OAuth2RestClient(emitter, cfg);
    options.useBaseURLFromConfig = false;
    options.url = baseURL;
    nock(baseURL)
      .get('/')
      .reply(notFoundStatusCode, notFoundBody);
    await client.makeRequest(options)
      .then(() => {
        throw new Error('Test case does not expect success response');
      })
      .catch((e) => {
        expect(e.message).to.be.equal(errNotFound);
        expect(emitter.emit.withArgs('updateKeys').callCount).to.be.equal(0);
      });
  });

  it('Test makeRequest with expired access_token', async () => {
    const cfgExpToken = {
      resourceServerUrl: baseURL,
      oauth2: {
        refresh_token: 'some_token',
        scope: [
          'SOME_SCOPE',
        ],
        expires_in: 3599,
        access_token: 'some_token',
        tokenExpiryTime: (new Date(new Date().getTime() - 1000)).toISOString(),
      },
      authorizationServerTokenEndpointUrl: 'https://some.url',
      oauth2_field_client_id: 'some_key',
      oauth2_field_client_secret: 'some_secret',
    };
    const clientExpiredToken = new OAuth2RestClient(emitter, cfgExpToken);
    options.url = baseURL;
    nock(baseURL)
      .get('/')
      .reply(successStatusCode, successBody);

    nock(cfgExpToken.authorizationServerTokenEndpointUrl)
      .post('/')
      .reply(successStatusCode, cfgExpToken.oauth2);

    options.useBaseURLFromConfig = false;
    const result = await clientExpiredToken.makeRequest(options);
    expect(result.body).to.be.deep.equal(successBody);
    expect(result.statusCode).to.be.deep.equal(200);
    expect(emitter.emit.withArgs('updateKeys').callCount).to.be.equal(1);
    expect(emitter.emit.args[0][1]).to.be.equal(cfgExpToken.oauth2);
  });
});
