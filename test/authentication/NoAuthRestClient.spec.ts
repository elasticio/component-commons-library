import chai from 'chai';
import sinon from 'sinon';
import { Logger, NoAuthRestClient } from '../../lib';

import nock = require('nock');

const { expect } = chai;

const url = '/v2/user';
const baseURL = 'http://www.example.io';
const successBody = { result: 'ok' };
const redirectBody = { result: 'redirect' };
const successStatusCode = 200;
const redirectStatusCode = 301;
const notFoundStatusCode = 404;
const notFoundBody = 'Not found';
const cfg = {
  baseURL,
  followRedirect: false,
  dontThrowError: false,
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
      logger: Logger.getLogger(),
    };
  });

  afterEach(() => {
    nock.cleanAll();
    sinon.restore();
  });

  describe('NoAuthRestClient 200', () => {
    it('Should succeed, urlIsSegment: true', async () => {
      nock(baseURL)
        .get(url)
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
  });
  describe('NoAuthRestClient 404', () => {
    it('Should fail, 404', async () => {
      const client = new NoAuthRestClient(emitter, cfg);
      nock(baseURL)
        .get(url)
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
  describe('NoAuthRestClient 301', () => {
    const redirectUrl = '/Login';
    const redirectHeader = {
      location: `${baseURL}${redirectUrl}`,
    };
    describe('Should succeed redirect', () => {
      beforeEach(() => {
        nock(baseURL)
          .get(url)
          .reply(redirectStatusCode, redirectBody, redirectHeader)
          .get(redirectUrl)
          .reply(successStatusCode, successBody);
      });
      it('Should succeed, 301 redirect disabled', async () => {
        cfg.followRedirect = false;
        const client = new NoAuthRestClient(emitter, cfg);
        const result = await client.makeRequest(options);
        expect(result.statusCode).to.be.equal(redirectStatusCode);
        expect(result.body).to.be.deep.equal(redirectBody);
        expect(result.headers).to.include(redirectHeader);
      });

      it('Should succeed, 200 redirect enabled', async () => {
        cfg.followRedirect = true;
        const client = new NoAuthRestClient(emitter, cfg);
        const result = await client.makeRequest(options);
        expect(result.statusCode).to.be.deep.equal(successStatusCode);
      });
    });

    describe('Should fail redirect', () => {
      beforeEach(() => {
        cfg.followRedirect = true;
        nock(baseURL)
          .get(url)
          .reply(redirectStatusCode, redirectBody, redirectHeader)
          .get(redirectUrl)
          .reply(redirectStatusCode);
      });
      const redirectionError = 'Redirection error. Please enable redirect mode';
      it('Should fail, redirect enabled, dontThrowError disabled', async () => {
        cfg.dontThrowError = false;
        const client = new NoAuthRestClient(emitter, cfg);
        await client.makeRequest(options)
          .then(() => {
            throw new Error('Test case does not expect success response');
          })
          .catch((e) => {
            expect(e.message).to.be.include(redirectionError);
          });
      });

      it('Should fail, redirect enabled, dontThrowError enabled', async () => {
        cfg.dontThrowError = true;
        const client = new NoAuthRestClient(emitter, cfg);
        const result = await client.makeRequest(options);
        expect(result.statusCode).to.be.equal(redirectStatusCode);
        expect(result.statusText).to.be.include(redirectionError);
      });
    });
  });
});
