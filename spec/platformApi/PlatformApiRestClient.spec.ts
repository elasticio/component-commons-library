import chai from 'chai';
import sinon from 'sinon';
import { NoAuthRestClient, Logger, PlatformApiRestClient } from '../../src';
import * as flow from '../helpers/flow.json';

const { expect } = chai;
let emitter;
const url = 'https://example.com';
const email = process.env.ELASTICIO_API_USERNAME || 'userName';
const apiKey = process.env.ELASTICIO_API_KEY || 'dXNlck5hbWU6YXBpS2V5';
const resourceServerUrl = 'https://resourceServerUrl.com';
const successStatusCode = 200;
const notFoundStatusCode = 404;
let successBody: any;
let cfg;
let stub;

describe('PlatformApiRestClient', () => {
  const user = 'user';
  const pass = 'pass';
  let client;

  beforeEach(() => {
    emitter = {
      emit: sinon.spy(),
      logger: Logger.getLogger(),
    };
    cfg = {
      resourceServerUrl,
      username: user,
      password: pass,
      url,
      email,
      apiKey,
    };
    client = new PlatformApiRestClient(emitter, cfg);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should succeed handle rest response', async () => {
    const response = {
      statusCode: successStatusCode,
      body: flow,
    };
    successBody = flow;
    stub = sinon.stub(client, 'handleRestResponse');
    stub.withArgs(response).returns(successBody);
    const result = await client.handleRestResponse(response);
    expect(result).to.be.deep.equal(successBody);
  });

  it('Should fail handle rest response', async () => {
    const response = {
      statusCode: notFoundStatusCode,
      body: {
        errors: [{ message: 'Error in making request' }],
      },
    };
    const body = {
      errors: [{ message: 'Error in making request' }],
    };
    stub = sinon.stub(client, 'handleRestResponse');
    stub.withArgs(response).returns(body);
    try {
      const result = await client.handleRestResponse(response);
      if (result) {
        throw new Error('Test case does not expect success response');
      }
    } catch (e) {
      expect(e.message).to.be.contains('Test case does not expect success response');
    }
  });

  it('Should succeed make request with user-agent Headers', async () => {
    successBody = flow;
    stub = sinon.stub(NoAuthRestClient.prototype, 'makeRequest');
    stub.returns(successBody);
    const requestBody = { url: 'https://example.com', method: 'GET', headers: { 'Content-Type': 'application/json' } };
    const platformClient = new PlatformApiRestClient(emitter, cfg, 'UnitTest/1.0', 'messageId');
    const result = await platformClient.makeRequest(requestBody);
    expect(result).to.be.deep.equal(successBody);
    expect(stub.called).to.be.equal(true);
    expect(stub.firstCall.args[0].headers).to.be.deep.equal({
      'Content-Type': 'application/json',
      'User-Agent': 'UnitTest/1.0 request/2.88.2',
      'x-request-id': 'f:undefined;s:undefined;m:messageId'
    });
  });
});
