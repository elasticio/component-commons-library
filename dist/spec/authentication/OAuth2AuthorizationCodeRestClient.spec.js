"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const nock_1 = __importDefault(require("nock"));
const sinon_1 = __importDefault(require("sinon"));
const { expect } = chai_1.default;
const src_1 = require("../../src");
let options;
let emitter;
const url = 'https://example.com';
const resourceServerUrl = 'https://resourceServerUrl.com';
const successStatusCode = 200;
const notFoundStatusCode = 404;
const successBody = 'Ok';
const notFoundBody = 'Not found';
const errNotFound = `Error in making request to ${url}/ Status code: ${notFoundStatusCode}, Body: "${notFoundBody}"`;
const cfg = {
    resourceServerUrl,
    oauth2: {
        refresh_token: 'some_token',
        scope: [
            'SOME_SCOPE',
        ],
        expires_in: 3599,
        access_token: 'some_token',
        tokenExpiryTime: (new Date(new Date().getTime() + 10000)).toISOString(),
    },
    authorizationServerTokenEndpointUrl: 'https://some.url',
    oauth2_field_client_id: 'some_key',
    oauth2_field_client_secret: 'some_secret',
};
describe('OAuth2AuthorizationCodeRestClient', () => {
    beforeEach(() => {
        options = {
            url,
            method: 'GET',
            body: {},
            headers: {},
        };
        emitter = {
            emit: sinon_1.default.spy(),
            logger: src_1.Logger.getLogger(),
        };
    });
    afterEach(() => {
        sinon_1.default.restore();
    });
    it('Should succeed, urlIsSegment: true', async () => {
        const client = new src_1.OAuth2RestClient(emitter, cfg);
        (0, nock_1.default)(cfg.authorizationServerTokenEndpointUrl)
            .post('/')
            .reply(200, cfg.oauth2);
        (0, nock_1.default)(resourceServerUrl)
            .get(`/${url}`)
            .reply(successStatusCode, successBody);
        const result = await client.makeRequest(options);
        expect(result).to.be.deep.equal(successBody);
        expect(emitter.emit.withArgs('updateKeys').callCount).to.be.equal(0);
    });
    it('Should succeed, urlIsSegment: false', async () => {
        const client = new src_1.OAuth2RestClient(emitter, cfg);
        options.urlIsSegment = false;
        (0, nock_1.default)(url)
            .get('/')
            .reply(successStatusCode, successBody);
        const result = await client.makeRequest(options);
        expect(result).to.be.deep.equal(successBody);
        expect(emitter.emit.withArgs('updateKeys').callCount).to.be.equal(0);
    });
    it('Should fail, 404', async () => {
        const client = new src_1.OAuth2RestClient(emitter, cfg);
        options.urlIsSegment = false;
        (0, nock_1.default)(url)
            .get('/')
            .reply(notFoundStatusCode, notFoundBody);
        await client.makeRequest(options)
            .then(() => {
            throw new Error('Test case does not expect success response');
        })
            .catch((e) => {
            expect(e.message).to.be.equal(errNotFound);
            expect(emitter.emit.withArgs('updateKeys').callCount).to.be.equal(0);
        });
    });
    it('Test makeRequest with expired access_token', async () => {
        const cfgExpToken = {
            resourceServerUrl,
            oauth2: {
                refresh_token: 'some_token',
                scope: [
                    'SOME_SCOPE',
                ],
                expires_in: 3599,
                access_token: 'some_token',
                tokenExpiryTime: (new Date(new Date().getTime() - 1000)).toISOString(),
            },
            authorizationServerTokenEndpointUrl: 'https://some.url',
            oauth2_field_client_id: 'some_key',
            oauth2_field_client_secret: 'some_secret',
        };
        const clientExpiredToken = new src_1.OAuth2RestClient(emitter, cfgExpToken);
        (0, nock_1.default)(url)
            .get('/')
            .reply(successStatusCode, successBody);
        (0, nock_1.default)(cfgExpToken.authorizationServerTokenEndpointUrl)
            .post('/')
            .reply(successStatusCode, cfgExpToken.oauth2);
        options.urlIsSegment = false;
        const result = await clientExpiredToken.makeRequest(options);
        expect(result).to.be.deep.equal(successBody);
        expect(emitter.emit.withArgs('updateKeys').callCount).to.be.equal(1);
        expect(emitter.emit.args[0][1]).to.be.equal(cfgExpToken.oauth2);
    });
});
