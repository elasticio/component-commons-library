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
const logger = (0, logger_1.getLogger)();
exports.STORAGE_TYPE_PARAMETER = 'storage_type';
exports.DEFAULT_STORAGE_TYPE = 'steward';
exports.MAESTER_OBJECT_ID_ENDPOINT = '/objects/';
const { ELASTICIO_OBJECT_STORAGE_TOKEN = '', ELASTICIO_OBJECT_STORAGE_URI = '' } = process.env;
const maesterCreds = { jwtSecret: ELASTICIO_OBJECT_STORAGE_TOKEN, uri: ELASTICIO_OBJECT_STORAGE_URI };
const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT ? parseInt(process.env.REQUEST_TIMEOUT, 10) : 30000; // 30s timeout
const REQUEST_MAX_RETRY = process.env.REQUEST_MAX_RETRY ? parseInt(process.env.REQUEST_MAX_RETRY, 10) : 7; // 7 times could be retried
class AttachmentProcessor {
    async getAttachment(url, responseType) {
        const storageType = this.getStorageTypeByUrl(url);
        const axConfig = {
            url,
            responseType,
            method: 'get',
            timeout: REQUEST_TIMEOUT,
            retry: REQUEST_MAX_RETRY,
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
        const objectStorage = new maester_client_1.ObjectStorage(maesterCreds);
        return objectStorage.add(getAttachment, {
            headers,
            retryOptions: {
                retriesCount: retryOptions.retriesCount || REQUEST_MAX_RETRY,
                requestTimeout: retryOptions.requestTimeout || REQUEST_TIMEOUT
            },
        });
    }
    getMaesterAttachmentUrlById(attachmentId) {
        return `${maesterCreds.uri}${exports.MAESTER_OBJECT_ID_ENDPOINT}${attachmentId}?${exports.STORAGE_TYPE_PARAMETER}=maester`;
    }
    async getStewardAttachment(axConfig) {
        const ax = axios_1.default.create();
        this.addRetryCountInterceptorToAxios(ax);
        return ax(axConfig);
    }
    async getMaesterAttachment({ url, responseType }) {
        const client = new maester_client_1.StorageClient(maesterCreds);
        const objectStorage = new maester_client_1.ObjectStorage(maesterCreds, client);
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
