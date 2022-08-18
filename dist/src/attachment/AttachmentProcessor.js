"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentProcessor = exports.MAESTER_OBJECT_ID_ENDPOINT = exports.DEFAULT_STORAGE_TYPE = exports.STORAGE_TYPE_PARAMETER = void 0;
/* eslint-disable class-methods-use-this */
const axios_1 = __importDefault(require("axios"));
const url_1 = require("url");
const maester_client_1 = require("@elastic.io/maester-client");
const interfaces_1 = require("@elastic.io/maester-client/dist/src/interfaces");
const logger_1 = require("../logger/logger");
const package_json_1 = __importDefault(require("../../package.json"));
const logger = (0, logger_1.getLogger)();
const maesterClientVersion = package_json_1.default.dependencies['@elastic.io/maester-client'];
const axiosVersion = package_json_1.default.dependencies.axios;
exports.STORAGE_TYPE_PARAMETER = 'storage_type';
exports.DEFAULT_STORAGE_TYPE = 'steward';
exports.MAESTER_OBJECT_ID_ENDPOINT = '/objects/';
const { ELASTICIO_OBJECT_STORAGE_TOKEN = '', ELASTICIO_OBJECT_STORAGE_URI = '' } = process.env;
const maesterCreds = { jwtSecret: ELASTICIO_OBJECT_STORAGE_TOKEN, uri: ELASTICIO_OBJECT_STORAGE_URI };
const DEFAULT_ATTACHMENT_REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT ? parseInt(process.env.REQUEST_TIMEOUT, 10) : interfaces_1.REQUEST_TIMEOUT.maxValue; // 20s
class AttachmentProcessor {
    constructor(userAgent, msgId) {
        this.userAgent = userAgent;
        this.msgId = msgId;
    }
    async getAttachment(url, responseType) {
        const storageType = this.getStorageTypeByUrl(url);
        const axConfig = {
            url,
            responseType,
            method: 'get',
            timeout: DEFAULT_ATTACHMENT_REQUEST_TIMEOUT,
            retry: interfaces_1.RETRIES_COUNT.defaultValue,
        };
        switch (storageType) {
            case 'steward': return this.getStewardAttachment(axConfig);
            case 'maester': return this.getMaesterAttachment(axConfig);
            default: throw new Error(`Storage type "${storageType}" is not supported`);
        }
    }
    async uploadAttachment(getAttachment, retryOptions = {}, contentType) {
        logger.debug('uploading attachment..');
        const headers = {};
        if (contentType)
            headers[interfaces_1.CONTENT_TYPE_HEADER] = contentType;
        const objectStorage = new maester_client_1.ObjectStorage({ ...maesterCreds, userAgent: this.userAgent });
        return objectStorage.add(getAttachment, {
            headers,
            retryOptions: {
                requestTimeout: retryOptions.requestTimeout || DEFAULT_ATTACHMENT_REQUEST_TIMEOUT
            },
        });
    }
    getMaesterAttachmentUrlById(attachmentId) {
        return `${maesterCreds.uri}${exports.MAESTER_OBJECT_ID_ENDPOINT}${attachmentId}?${exports.STORAGE_TYPE_PARAMETER}=maester`;
    }
    async getStewardAttachment(axConfig) {
        const ax = axios_1.default.create();
        this.addRetryCountInterceptorToAxios(ax);
        const userAgent = `${this.userAgent} axios/${axiosVersion}`;
        return ax({
            ...axConfig,
            headers: {
                'User-Agent': userAgent,
                'x-request-id': `f:${process.env.ELASTICIO_FLOW_ID};s:${process.env.ELASTICIO_STEP_ID};m:${this.msgId}`,
            }
        });
    }
    async getMaesterAttachment({ url, responseType }) {
        const userAgent = `${this.userAgent} maester-client/${maesterClientVersion}`;
        const objectStorage = new maester_client_1.ObjectStorage({ ...maesterCreds, userAgent, msgId: this.msgId });
        const maesterAttachmentId = this.getMaesterAttachmentIdByUrl(url);
        const response = await objectStorage.getOne(maesterAttachmentId, { responseType });
        return { data: response };
    }
    getStorageTypeByUrl(urlString) {
        const url = new url_1.URL(urlString);
        const storageType = url.searchParams.get(exports.STORAGE_TYPE_PARAMETER);
        return storageType || exports.DEFAULT_STORAGE_TYPE;
    }
    getMaesterAttachmentIdByUrl(urlString) {
        const { pathname } = new url_1.URL(urlString);
        const maesterAttachmentId = pathname.split(exports.MAESTER_OBJECT_ID_ENDPOINT)[1];
        if (!maesterAttachmentId) {
            throw new Error('Invalid Maester Endpoint');
        }
        return maesterAttachmentId;
    }
    addRetryCountInterceptorToAxios(ax) {
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
            return new Promise((resolve) => setTimeout(() => resolve(ax(config)), config.delay));
        });
    }
}
exports.AttachmentProcessor = AttachmentProcessor;
