"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const restNodeClient = require('elasticio-rest-node')();
const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT ? parseInt(process.env.REQUEST_TIMEOUT, 10) : 10000; // 10s
const REQUEST_MAX_RETRY = process.env.REQUEST_MAX_RETRY ? parseInt(process.env.REQUEST_MAX_RETRY, 10) : 7; // 10s
const REQUEST_RETRY_DELAY = process.env.REQUEST_RETRY_DELAY ? parseInt(process.env.REQUEST_RETRY_DELAY, 10) : 7000; // 7s
const REQUEST_MAX_CONTENT_LENGTH = process.env.REQUEST_MAX_CONTENT_LENGTH ? parseInt(process.env.REQUEST_MAX_CONTENT_LENGTH, 10) : 10485760; // 10MB
class AttachmentProcessor {
    async getAttachment(url, responseType) {
        const ax = axios_1.default.create();
        AttachmentProcessor.addRetryCountInterceptorToAxios(ax);
        const axConfig = {
            url,
            responseType,
            method: 'get',
            timeout: REQUEST_TIMEOUT,
            retry: REQUEST_MAX_RETRY,
            delay: REQUEST_RETRY_DELAY,
        };
        return ax(axConfig);
    }
    async uploadAttachment(body) {
        const putUrl = await AttachmentProcessor.preparePutUrl();
        const ax = axios_1.default.create();
        AttachmentProcessor.addRetryCountInterceptorToAxios(ax);
        const axConfig = {
            url: putUrl,
            data: body,
            method: 'put',
            timeout: REQUEST_TIMEOUT,
            retry: REQUEST_MAX_RETRY,
            delay: REQUEST_RETRY_DELAY,
            maxContentLength: REQUEST_MAX_CONTENT_LENGTH,
        };
        return ax(axConfig);
    }
    static async preparePutUrl() {
        const signedUrl = await restNodeClient.resources.storage.createSignedUrl();
        return signedUrl.put_url;
    }
    static addRetryCountInterceptorToAxios(ax) {
        ax.interceptors.response.use(undefined, (err) => {
            const { config } = err;
            if (!config || !config.retry || !config.delay) {
                return Promise.reject(err);
            }
            config.currentRetryCount = config.currentRetryCount || 0;
            if (config.currentRetryCount >= config.retry) {
                return Promise.reject(err);
            }
            config.currentRetryCount += 1;
            return new Promise(resolve => setTimeout(() => resolve(ax(config)), config.delay));
        });
    }
}
exports.AttachmentProcessor = AttachmentProcessor;
//# sourceMappingURL=AttachmentProcessor.js.map