import chai from 'chai';
import path from 'path';

require('dotenv').config({ path: path.resolve(__dirname, './index.env'), override: true });

// eslint-disable-next-line import/first
import { getRetryOptions, API_RETRIES_COUNT } from '../../src/externalApi';

const { expect } = chai;

describe('externalApi', () => {
  it('Should validateAndGetRetryOptions', async () => {
    const { retriesCount, requestTimeout } = getRetryOptions();
    expect(retriesCount).to.be.equal(API_RETRIES_COUNT.defaultValue);
    expect(requestTimeout).to.be.equal(1000);
  });
});
