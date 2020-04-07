import chai from 'chai';
import sinon from 'sinon';
import { Logger, NoAuthRestClient } from '../../lib';
import { RequestFeature } from '../../lib/features';

const { expect } = chai;
const logger = Logger.getLogger();
const url = '/v2/5e871e123100000bff81862c';
const baseURL = 'http://www.mocky.io';
const cfg = {
  baseURL,
  dontThrowError: false,
  followRedirect: false,
};

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
      logger,
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should succeed, register request features', async () => {
    cfg.dontThrowError = true;
    cfg.followRedirect = true;
    const client = new NoAuthRestClient(emitter, cfg);
    client.registerRequestFeature(RequestFeature.Gzip);
    const result = await client.makeRequest(options);
    expect(result.statusCode).to.be.deep.equal(200);
  });
});
