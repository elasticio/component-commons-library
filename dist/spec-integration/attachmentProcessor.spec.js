"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chai_1 = require("chai");
const common_1 = require("./common");
const AttachmentProcessor_1 = require("../src/attachment/AttachmentProcessor");
(0, common_1.setEnvs)();
describe('AttachmentProcessor', () => {
    describe('uploadAttachment', () => {
        it('uploadAttachment (/samples/sample.json)', async () => {
            const file = fs_1.default.createReadStream(path_1.default.join(__dirname, './samples/sample.json'));
            const res = await new AttachmentProcessor_1.AttachmentProcessor().uploadAttachment(file, 'application/octet-stream');
            (0, chai_1.expect)(res.data.contentType).to.be.equal('application/octet-stream');
        });
        it('uploadAttachment (/samples/image.png)', async () => {
            const file = fs_1.default.createReadStream(path_1.default.join(__dirname, './samples/image.png'));
            const res = await new AttachmentProcessor_1.AttachmentProcessor().uploadAttachment(file, 'image/png');
            (0, chai_1.expect)(res.data.contentType).to.be.equal('image/png');
        });
    });
});
