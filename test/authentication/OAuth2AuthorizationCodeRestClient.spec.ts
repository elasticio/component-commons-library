import chai from 'chai';
import nock from 'nock';
import sinon from 'sinon';

const { expect } = chai;
import { Logger, OAuth2RestClient } from '../../lib';

let options;
let emitter;
const url = 'https://example.com';
const resourceServerUrl = 'https://resourceServerUrl.com';
const successStatusCode = 200;
const notFoundStatusCode = 404;
const successBody = 'Ok';
const notFoundBody = 'Not found';
const errNotFound = `Error in making request to ${url}/ Status code: ${notFoundStatusCode}, Body: "${notFoundBody}"`;
const cfg = {
  resourceServerUrl,
  oauth2: {
    refresh_token: 'some_token',
    scope: [
      'SOME_SCOPE',
    ],
    expires_in: 3599,
    access_token: 'some_token',
    tokenExpiryTime: (new Date(new Date().getTime() + 1000)).toISOString(),
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

  it('Should succeed, urlIsSegment: true', async () => {
    const client = new OAuth2RestClient(emitter, cfg);
    nock(resourceServerUrl)
      .get(`/${url}`)
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result).to.be.deep.equal(successBody);
    expect(emitter.emit.withArgs('updateKeys').callCount).to.be.equal(0);
  });

  it('Should succeed, urlIsSegment: false', async () => {
    const client = new OAuth2RestClient(emitter, cfg);
    options.urlIsSegment = false;
    nock(url)
      .get('/')
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result).to.be.deep.equal(successBody);
    expect(emitter.emit.withArgs('updateKeys').callCount).to.be.equal(0);
  });

  it('Should fail, 404', async () => {
    const client = new OAuth2RestClient(emitter, cfg);
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
        expect(emitter.emit.withArgs('updateKeys').callCount).to.be.equal(0);
      });
  });

  it('Test makeRequest with expired access_token', async () => {
    const cfgExpToken = {
      resourceServerUrl,
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
    nock(url)
      .get('/')
      .reply(successStatusCode, successBody);

    nock(cfgExpToken.authorizationServerTokenEndpointUrl)
      .post('/')
      .reply(successStatusCode, cfgExpToken.oauth2);

    options.urlIsSegment = false;
    const result = await clientExpiredToken.makeRequest(options);
    expect(result).to.be.deep.equal(successBody);
    expect(emitter.emit.withArgs('updateKeys').callCount).to.be.equal(1);
    expect(emitter.emit.args[0][1]).to.be.equal(cfgExpToken.oauth2);
  });
});
