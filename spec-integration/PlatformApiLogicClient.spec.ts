import chai, { expect } from 'chai';
import sinon from 'sinon';
import { creds } from './common';
import { PlatformApiLogicClient, Logger } from '../src';

chai.use(require('chai-as-promised'));

describe('PlatformApiLogicClient', () => {
  let emitter;
  let client;
  beforeEach(() => {
    emitter = {
      emit: sinon.spy(),
      logger: Logger.getLogger(),
    };
    client = new PlatformApiLogicClient(emitter, creds);
  });
  afterEach(() => {
    sinon.restore();
  });

  it('fetchSecretById test', async () => {
    const secret = await client.fetchSecretById({ secretId: creds.secretId });
    expect(secret.attributes.type).to.be.equal('oauth2');
  });

  it('refreshTokenBySecretId test', async () => {
    const secret = await client.refreshTokenBySecretId({ secretId: creds.secretId });
    expect(secret.attributes.type).to.be.equal('oauth2');
  });
});
