import 'mocha';
import { expect } from 'chai';
import axios from 'axios';
import nock from 'nock';
import { MAX_REDIRECTS_COUNT, REQUEST_MAX_CONTENT_LENGTH, REQUEST_TIMEOUT } from '../../lib/Constants';
import { parseResponse } from '../../lib/helpers';


describe('Response parser tests', () => {
  let client;
  let options;
  before(() => {
    client = axios.create();
    options = {
      method: 'get',
      url: 'https://jsonplaceholder.typicode.com/todos/1',
      rebound: false,
      maxRedirects: MAX_REDIRECTS_COUNT,
      maxContentLength: REQUEST_MAX_CONTENT_LENGTH,
      validateStatus: () => true,
      timeout: REQUEST_TIMEOUT,
    };
  });


  it('Response is JSON object', async () => {
    // nock.recorder.rec();
    const headers = [
      'Date',
      'Thu, 02 Apr 2020 10:00:35 GMT',
      'Content-Type',
      'application/json; charset=utf-8',
      'Content-Length',
      '83',
      'Connection',
      'close',
      'Set-Cookie',
      '__cfduid=d733608d71384031d1f965bdae9d496981585821635; expires=Sat, 02-May-20 10:00:35 GMT; path=/; domain=.typicode.com; HttpOnly; SameSite=Lax',
      'X-Powered-By',
      'Express',
      'Vary',
      'Origin, Accept-Encoding',
      'Access-Control-Allow-Credentials',
      'true',
      'Cache-Control',
      'max-age=14400',
      'Pragma',
      'no-cache',
      'Expires',
      '-1',
      'X-Content-Type-Options',
      'nosniff',
      'Etag',
      'W/"53-hfEnumeNh6YirfjyjaujcOPPT+s"',
      'Via',
      '1.1 vegur',
      'CF-Cache-Status',
      'HIT',
      'Age',
      '100',
      'Accept-Ranges',
      'bytes',
      'Expect-CT',
      'max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"',
      'Server',
      'cloudflare',
      'CF-RAY',
      '57d9b4269a1abfbb-MAN',
    ];

    const body = {
      userId: 1, id: 1, title: 'delectus aut autem', completed: false,
    };
    nock('https://jsonplaceholder.typicode.com:443', { encodedQueryParams: true })
      .get('/todos/1')
      .reply(200, body, headers);

    const response = await client(options);
    const result = parseResponse(response);
    expect(result.body).to.deep.equal(body);
    expect(result.headers['content-type']).to.includes('application/json');
  });
});
