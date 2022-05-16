"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chai_1 = require("chai");
const common_1 = require("./common");
(0, common_1.setEnvs)();
// eslint-disable-next-line import/first
const AttachmentProcessor_1 = require("../src/attachment/AttachmentProcessor");
describe('AttachmentProcessor', () => {
    describe('uploadAttachment', () => {
        it('uploadAttachment (/samples/sample.json)', async () => {
            const file = fs_1.default.createReadStream(path_1.default.join(__dirname, './samples/sample.json'));
            const { data } = await new AttachmentProcessor_1.AttachmentProcessor().uploadAttachment(file);
            (0, chai_1.expect)(data.contentType).to.be.equal('application/json');
        });
        it('uploadAttachment (/samples/image.png)', async () => {
            const file = fs_1.default.createReadStream(path_1.default.join(__dirname, './samples/image.png'));
            const { data } = await new AttachmentProcessor_1.AttachmentProcessor().uploadAttachment(file);
            (0, chai_1.expect)(data.contentType).to.be.equal('image/png');
        });
    });
});
