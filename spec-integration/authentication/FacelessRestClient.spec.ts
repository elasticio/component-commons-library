import chai, { expect } from 'chai';
import sinon from 'sinon';
import { creds } from '../common';
import { FacelessRestClient, Logger } from '../../src';

chai.use(require('chai-as-promised'));

describe('FacelessRestClient', () => {
  let emitter;
  let client;
  beforeEach(() => {
    emitter = {
      emit: sinon.spy(),
      logger: Logger.getLogger(),
    };
    client = new FacelessRestClient(emitter, creds, 'Unit test/1.0', 'messageId');
  });
  afterEach(() => {
    sinon.restore();
  });

  it('makeRequest test', async () => {
    const options = {
      url: '/accounts?$select=name',
      method: 'GET'
    };
    const result = await client.makeRequest(options);
    expect(result.value.length).to.be.equal(5);
  });
});
