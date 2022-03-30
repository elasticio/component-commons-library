"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-buffer-constructor */
const chai_1 = __importDefault(require("chai"));
const fs_1 = __importDefault(require("fs"));
const stream_1 = require("stream");
const sinon_1 = __importDefault(require("sinon"));
const dist_1 = require("@elastic.io/maester-client/dist");
const AttachmentProcessor_1 = require("../../src/attachment/AttachmentProcessor");
const { expect } = chai_1.default;
const maesterUri = 'https://ma.estr';
process.env.ELASTICIO_OBJECT_STORAGE_TOKEN = 'token';
process.env.ELASTICIO_OBJECT_STORAGE_URI = maesterUri;
const formStream = (dataString) => {
    const stream = new stream_1.Readable();
    stream.push(dataString);
    stream.push(null);
    return stream;
};
xdescribe('AttachmentProcessor', () => {
    const attachmentProcessor = new AttachmentProcessor_1.AttachmentProcessor();
    describe('Steward', () => {
        it('Should successfully retrieve csv', async () => {
            const attachmentOptions = {
                'content-type': 'arraybuffer',
                url: 'http://insight.dev.schoolwires.com/HelpAssets/C2Assets/C2Files/C2ImportCalEventSample.csv',
            };
            const result = await attachmentProcessor.getAttachment(attachmentOptions.url, attachmentOptions['content-type']);
            const encodedResult = new Buffer(result.data, 'binary').toString('base64');
            const expectedResult = fs_1.default.readFileSync('spec/attachment/resources/base64csv.txt').toString();
            expect(encodedResult).to.be.equal(expectedResult);
        });
        it('Should successfully retrieve png image', async () => {
            const attachmentOptions = {
                'content-type': 'arraybuffer',
                url: `https://httpbin.org/image/png?${AttachmentProcessor_1.STORAGE_TYPE_PARAMETER}=steward`,
            };
            const result = await attachmentProcessor.getAttachment(attachmentOptions.url, 'arraybuffer');
            const encodedResult = new Buffer(result.data, 'binary').toString('base64');
            const expectedResult = fs_1.default.readFileSync('spec/attachment/resources/base64Png.txt').toString();
            expect(encodedResult).to.be.equal(expectedResult);
        });
    });
    describe('maester', () => {
        let getById;
        beforeEach(() => {
            getById = sinon_1.default.stub(dist_1.ObjectStorage.prototype, 'getById').callsFake(async () => ({ data: formStream('i`m a stream') }));
        });
        afterEach(() => {
            sinon_1.default.restore();
        });
        it('Should successfully retrieve response (stream)', async () => {
            const attachmentOptions = {
                'content-type': 'stream',
                url: `${maesterUri}${AttachmentProcessor_1.MAESTER_OBJECT_ID_ENDPOINT}object_id?${AttachmentProcessor_1.STORAGE_TYPE_PARAMETER}=maester`,
            };
            const result = await attachmentProcessor.getAttachment(attachmentOptions.url, attachmentOptions['content-type']);
            expect(result.toString('base64')).to.be.equal({ data: formStream('i`m a stream') }.toString());
            expect(getById.getCall(0).args[0]).to.be.equal('object_id');
            expect(getById.getCall(0).args[1]).to.be.equal('stream');
        });
    });
});
