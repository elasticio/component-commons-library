import chai from 'chai';
import sinon from 'sinon';
import nock from 'nock';
import { Logger, NoAuthRestClient } from '../../lib';
import { RequestFeature, ResponseFeature } from '../../lib/features';

const { expect } = chai;
const logger = Logger.getLogger();
const url = '/v2/user';
const baseURL = 'http://www.example.io';
const cfg = {
  baseURL,
  dontThrowError: false,
  followRedirect: false,
};
const successBody = { result: 'ok' };
const successStatusCode = 200;

describe('registerRequestFeature test', () => {
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
      logger,
    };
  });

  afterEach(() => {
    nock.cleanAll();
    sinon.restore();
  });

  it('Should succeed, register Gzip request features', async () => {
    nock(baseURL)
      .get(url)
      .reply(successStatusCode, successBody);
    const client = new NoAuthRestClient(emitter, cfg);
    client.registerRequestFeature(RequestFeature.Gzip);
    client.replaceDefaultResponseHandler((response) => response);
    const result = await client.makeRequest(options);
    expect(result.data).to.deep.equal(successBody);
    expect(result.config.headers).to.include({ 'accept-encoding': 'gzip, deflate' });
  });

  it('Should succeed, register Xml2Json response features', async () => {
    nock(baseURL)
      .get(url)
      .reply(200, '<xml>foo</xmlasdf>', {
        'Content-Type': 'application/xml',
      });
    const client = new NoAuthRestClient(emitter, cfg);
    client.registerResponseFeature(ResponseFeature.Xml2Json);
    const result = await client.makeRequest(options);
    expect(result.body).to.deep.equal({ xml: 'foo' });
  });
});
