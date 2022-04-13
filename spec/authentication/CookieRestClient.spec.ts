import chai from 'chai';
import nock from 'nock';
import sinon from 'sinon';
import { CookieRestClient, Logger } from '../../src';

const { expect } = chai;
chai.use(require('chai-as-promised'));

let options;
let emitter;
const loginUrl = 'https://resourceserverurl.com/login';
const logoutUrl = 'https://resourceserverurl.com/logout';
const logoutMethod = 'POST';
const resourceServerUrl = 'https://resourceserverurl.com';
const successBody = 'Ok';
let cfg;

describe('CookieRestClient', () => {
  const username = 'example username';
  const password = 'some password';
  let client;
  let cookieExpiryTime;

  beforeEach(() => {
    options = {
      url: '/resource',
      method: 'GET',
    };
    emitter = {
      emit: sinon.spy(),
      logger: Logger.getLogger(),
    };

    cfg = {
      resourceServerUrl,
      username,
      password,
      loginUrl,
    };

    client = new CookieRestClient(emitter, cfg);
    cookieExpiryTime = (new Date(new Date().getTime() + 60000)).toUTCString();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Login -> Call -> No Op Logout', async () => {
    nock(resourceServerUrl)
      .post('/login', 'username=example%20username&password=some%20password')
      .reply(200, undefined, {
        'Set-Cookie': [
          'Cookie1=ABCDEF; domain=resourceServerUrl.com; path=/; secure; HttpOnly',
          `Cookie2=XYZ; path=/; expires=${cookieExpiryTime}; httpOnly; secure`,
        ],
      });

    nock(resourceServerUrl, {
      reqheaders: {
        cookie: 'Cookie1=ABCDEF; Cookie2=XYZ',
      },
    })
      .get('/resource')
      .reply(200, successBody);

    await client.login();
    const result = await client.makeRequest(options);
    await client.logout();
    expect(result).to.be.deep.equal(successBody);
  });

  it('Login -> Call -> Logout', async () => {
    cfg.logoutUrl = logoutUrl;
    cfg.logoutMethod = logoutMethod;
    nock(resourceServerUrl)
      .post('/login', 'username=example%20username&password=some%20password')
      .reply(200, undefined, {
        'Set-Cookie': [
          'Cookie1=ABCDEF; domain=resourceServerUrl.com; path=/; secure; HttpOnly',
          `Cookie2=XYZ; path=/; expires=${cookieExpiryTime}; httpOnly; secure`,
        ],
      });

    nock(resourceServerUrl, {
      reqheaders: {
        cookie: 'Cookie1=ABCDEF; Cookie2=XYZ',
      },
    })
      .get('/resource')
      .reply(200, successBody);

    nock(resourceServerUrl, {
      reqheaders: {
        cookie: 'Cookie1=ABCDEF; Cookie2=XYZ',
      },
    })
      .post('/logout')
      .reply(200);

    await client.login();
    const result = await client.makeRequest(options);
    await client.logout();
    expect(result).to.be.deep.equal(successBody);
  });

  it('Logout Only', async () => {
    cfg.logoutUrl = logoutUrl;
    cfg.logoutMethod = logoutMethod;
    nock(resourceServerUrl)
      .post('/logout')
      .reply(400, 'Not Logged In');
    await client.logout();
  });

  it('Call (No Pre-Login)', async () => {
    nock(resourceServerUrl)
      .post('/login', 'username=example%20username&password=some%20password')
      .reply(200, undefined, {
        'Set-Cookie': [
          'Cookie1=ABCDEF; domain=resourceServerUrl.com; path=/; secure; HttpOnly',
          `Cookie2=XYZ; path=/; expires=${cookieExpiryTime}; httpOnly; secure`,
        ],
      });

    nock(resourceServerUrl, {
      reqheaders: {
        cookie: 'Cookie1=ABCDEF; Cookie2=XYZ',
      },
    })
      .get('/resource')
      .reply(200, successBody);

    const result = await client.makeRequest(options);
    await client.logout();
    expect(result).to.be.deep.equal(successBody);
  });

  it('Login Failure', async () => {
    nock(resourceServerUrl)
      .post('/login', 'username=example%20username&password=some%20password')
      .reply(401, 'Wrong Password');

    await expect(client.login()).to.be.rejectedWith(Error);
  });

  it('Logout Failure', async () => {
    cfg.logoutUrl = logoutUrl;
    cfg.logoutMethod = logoutMethod;
    nock(resourceServerUrl)
      .post('/login', 'username=example%20username&password=some%20password')
      .reply(200, undefined, {
        'Set-Cookie': [
          'Cookie1=ABCDEF; domain=resourceServerUrl.com; path=/; secure; HttpOnly',
          `Cookie2=XYZ; path=/; expires=${cookieExpiryTime}; httpOnly; secure`,
        ],
      });

    nock(resourceServerUrl, {
      reqheaders: {
        cookie: 'Cookie1=ABCDEF; Cookie2=XYZ',
      },
    })
      .post('/logout')
      .reply(500, 'Server Error');

    await client.login();
    await expect(client.logout()).to.be.rejectedWith(Error);
  });
});
