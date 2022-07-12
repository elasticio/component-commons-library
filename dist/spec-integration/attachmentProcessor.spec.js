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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chai_1 = __importStar(require("chai"));
const axios_1 = __importDefault(require("axios"));
const maester_client_1 = require("@elastic.io/maester-client");
const stream_1 = require("stream");
const common_1 = require("./common");
const AttachmentProcessor_1 = require("../src/attachment/AttachmentProcessor");
chai_1.default.use(require('chai-as-promised'));
describe('AttachmentProcessor', () => {
    const objectStorage = new maester_client_1.ObjectStorage({ uri: common_1.creds.uri, jwtSecret: common_1.creds.token });
    const attachmentProcessor = new AttachmentProcessor_1.AttachmentProcessor();
    describe('uploadAttachment', () => {
        it('uploadAttachment (/samples/sample.json)', async () => {
            const getFileAsStream = async () => fs_1.default.createReadStream(path_1.default.join(__dirname, './samples/sample.json'));
            const objectId = await attachmentProcessor.uploadAttachment(getFileAsStream);
            const objectHeaders = await objectStorage.getHeaders(objectId);
            (0, chai_1.expect)(objectHeaders['content-type']).to.be.equal('application/json');
        });
        it('uploadAttachment (/samples/image.png)', async () => {
            const getFileAsStream = async () => fs_1.default.createReadStream(path_1.default.join(__dirname, './samples/image.png'));
            const objectId = await attachmentProcessor.uploadAttachment(getFileAsStream);
            const objectHeaders = await objectStorage.getHeaders(objectId);
            (0, chai_1.expect)(objectHeaders['content-type']).to.be.equal('image/png');
        });
        it('uploadAttachment (axios, pdf)', async () => {
            const getAttachAsStream = async () => (await axios_1.default.get('http://environmentclearance.nic.in/writereaddata/FormB/Agenda/2201201642EWMJ8Bpdf18.pdf', { responseType: 'stream' })).data;
            const objectId = await attachmentProcessor.uploadAttachment(getAttachAsStream);
            const objectHeaders = await objectStorage.getHeaders(objectId);
            (0, chai_1.expect)(objectHeaders['content-type']).to.be.equal('application/pdf');
        });
        it('uploadAttachment (axios, pdf) with custom content-type', async () => {
            const getAttachAsStream = async () => (await axios_1.default.get('http://environmentclearance.nic.in/writereaddata/FormB/Agenda/2201201642EWMJ8Bpdf18.pdf', { responseType: 'stream' })).data;
            const objectId = await attachmentProcessor.uploadAttachment(getAttachAsStream, {}, 'some-content-type');
            const objectHeaders = await objectStorage.getHeaders(objectId);
            (0, chai_1.expect)(objectHeaders['content-type']).to.be.equal('some-content-type');
        });
        it('uploadAttachment buffer to stream', async () => {
            const getFileAsStream = async () => stream_1.Readable.from(fs_1.default.readFileSync(path_1.default.join(__dirname, './samples/sample.json').toString()));
            const objectId = await attachmentProcessor.uploadAttachment(getFileAsStream);
            const objectHeaders = await objectStorage.getHeaders(objectId);
            (0, chai_1.expect)(objectHeaders['content-type']).to.be.equal('application/json');
        });
    });
});
