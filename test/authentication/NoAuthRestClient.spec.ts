import chai from 'chai';
import nock from 'nock';
import sinon from 'sinon';

const { expect } = chai;
import { Logger, NoAuthRestClient } from '../../lib';

const url = 'https://example.com';
const resourceServerUrl = 'https://resourceServerUrl.com';
const successStatusCode = 200;
const notFoundStatusCode = 404;
const successBody = 'Ok';
const notFoundBody = 'Not found';
const errNotFound = `Error in making request to ${url}/ Status code: ${notFoundStatusCode}, Body: "${notFoundBody}"`;
const cfg = { resourceServerUrl };

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
    const client = new NoAuthRestClient(emitter, cfg);
    nock(resourceServerUrl)
      .get(`/${url}`)
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result).to.be.deep.equal(successBody);
  });

  it('Should succeed, urlIsSegment: false', async () => {
    const client = new NoAuthRestClient(emitter, cfg);
    options.urlIsSegment = false;
    nock(url)
      .get('/')
      .reply(successStatusCode, successBody);
    const result = await client.makeRequest(options);
    expect(result).to.be.deep.equal(successBody);
  });

  it('Should fail, 404', async () => {
    const client = new NoAuthRestClient(emitter, cfg);
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
