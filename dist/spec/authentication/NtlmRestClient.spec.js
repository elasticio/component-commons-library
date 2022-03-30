"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const nock_1 = __importDefault(require("nock"));
const sinon_1 = __importDefault(require("sinon"));
const src_1 = require("../../src");
const { expect } = chai_1.default;
let options;
let emitter;
const url = 'https://example.com';
const resourceServerUrl = 'https://resourceServerUrl.com';
const successStatusCode = 200;
const notFoundStatusCode = 404;
const successBody = 'Ok';
const notFoundBody = 'Not found';
const errNotFound = `Error in making request to ${url}/ Status code: ${notFoundStatusCode}, Body: "${notFoundBody}"`;
let cfg;
describe('NtlmRestClient', () => {
    let client;
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
        cfg = {
            resourceServerUrl,
            username: 'ntlmUsername',
            password: 'ntlmPassword',
        };
        client = new src_1.NtlmRestClient(emitter, cfg);
    });
    afterEach(() => {
        sinon_1.default.restore();
    });
    it('Should succeed makeRequest method, urlIsSegment: false', async () => {
        options.urlIsSegment = false;
        (0, nock_1.default)(url)
            .get('/')
            .reply(successStatusCode, successBody);
        const result = await client.makeRequest(options);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should succeed makeRequest method, urlIsSegment: true', async () => {
        (0, nock_1.default)(resourceServerUrl)
            .get(`/${url}`)
            .reply(successStatusCode, successBody);
        const result = await client.makeRequest(options);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should fail, 400', async () => {
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
        });
    });
});
