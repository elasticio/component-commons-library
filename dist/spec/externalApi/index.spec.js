"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const path_1 = __importDefault(require("path"));
require('dotenv').config({ path: path_1.default.resolve(__dirname, './index.env'), override: true });
// eslint-disable-next-line import/first
const externalApi_1 = require("../../src/externalApi");
const { expect } = chai_1.default;
describe('externalApi', () => {
    it('Should validateAndGetRetryOptions', async () => {
        const { retriesCount, requestTimeout } = (0, externalApi_1.getRetryOptions)();
        expect(retriesCount).to.be.equal(externalApi_1.API_RETRIES_COUNT.defaultValue);
        expect(requestTimeout).to.be.equal(1000);
    });
});
