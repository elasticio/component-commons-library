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
const url = 'https://example.com';
const resourceServerUrl = 'https://resourceServerUrl.com';
const successStatusCode = 200;
const notFoundStatusCode = 404;
const successBody = 'Ok';
const notFoundBody = 'Not found';
const errNotFound = `Error in making request to ${url}/ Status code: ${notFoundStatusCode}, Body: "${notFoundBody}"`;
const cfg = { resourceServerUrl };
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
            emit: sinon_1.default.spy(),
            logger: src_1.Logger.getLogger(),
        };
    });
    afterEach(() => {
        sinon_1.default.restore();
    });
    it('Should succeed, urlIsSegment: true', async () => {
        const client = new src_1.NoAuthRestClient(emitter, cfg);
        (0, nock_1.default)(resourceServerUrl)
            .get(`/${url}`)
            .reply(successStatusCode, successBody);
        const result = await client.makeRequest(options);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should succeed, urlIsSegment: false', async () => {
        const client = new src_1.NoAuthRestClient(emitter, cfg);
        options.urlIsSegment = false;
        (0, nock_1.default)(url)
            .get('/')
            .reply(successStatusCode, successBody);
        const result = await client.makeRequest(options);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should fail, 404', async () => {
        const client = new src_1.NoAuthRestClient(emitter, cfg);
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
