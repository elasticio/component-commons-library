"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const sinon_1 = __importDefault(require("sinon"));
const src_1 = require("../../src");
const PlatformApiRestClient_1 = require("../../src/platformApi/PlatformApiRestClient");
const flow = __importStar(require("../helpers/flow.json"));
const { expect } = chai_1.default;
let emitter;
const url = 'https://example.com';
const email = process.env.ELASTICIO_API_USERNAME || 'userName';
const apiKey = process.env.ELASTICIO_API_KEY || 'dXNlck5hbWU6YXBpS2V5';
const resourceServerUrl = 'https://resourceServerUrl.com';
const successStatusCode = 200;
const notFoundStatusCode = 404;
let successBody;
let cfg;
let stub;
describe('PlatformApiRestClient', () => {
    const user = 'user';
    const pass = 'pass';
    let client;
    beforeEach(() => {
        emitter = {
            emit: sinon_1.default.spy(),
            logger: src_1.Logger.getLogger(),
        };
        cfg = {
            resourceServerUrl,
            username: user,
            password: pass,
            url,
            email,
            apiKey,
        };
        client = new PlatformApiRestClient_1.PlatformApiRestClient(emitter, cfg);
    });
    afterEach(() => {
        sinon_1.default.restore();
    });
    it('Should succeed handle rest response', async () => {
        const response = {
            statusCode: successStatusCode,
            body: flow,
        };
        successBody = flow;
        stub = sinon_1.default.stub(client, 'handleRestResponse');
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
        stub = sinon_1.default.stub(client, 'handleRestResponse');
        stub.withArgs(response).returns(body);
        try {
            const result = await client.handleRestResponse(response);
            if (result) {
                throw new Error('Test case does not expect success response');
            }
        }
        catch (e) {
            expect(e.message).to.be.contains('Test case does not expect success response');
        }
    });
});
