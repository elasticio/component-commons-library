"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentProcessor = exports.MAESTER_OBJECT_ID_ENDPOINT = exports.DEFAULT_STORAGE_TYPE = exports.STORAGE_TYPE_PARAMETER = void 0;
/* eslint-disable class-methods-use-this */
const axios_1 = __importDefault(require("axios"));
const url_1 = require("url");
const dist_1 = require("@elastic.io/maester-client/dist");
const form_data_1 = __importDefault(require("form-data"));
const logger_1 = require("../logger/logger");
const logger = (0, logger_1.getLogger)();
exports.STORAGE_TYPE_PARAMETER = 'storage_type';
exports.DEFAULT_STORAGE_TYPE = 'steward';
exports.MAESTER_OBJECT_ID_ENDPOINT = '/objects/';
const { ELASTICIO_OBJECT_STORAGE_TOKEN = '', ELASTICIO_OBJECT_STORAGE_URI = '' } = process.env;
const maesterCreds = { jwtSecret: ELASTICIO_OBJECT_STORAGE_TOKEN, uri: ELASTICIO_OBJECT_STORAGE_URI };
const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT ? parseInt(process.env.REQUEST_TIMEOUT, 10) : 10000; // 10s
const REQUEST_MAX_RETRY = process.env.REQUEST_MAX_RETRY ? parseInt(process.env.REQUEST_MAX_RETRY, 10) : 7; // 10s
const REQUEST_RETRY_DELAY = process.env.REQUEST_RETRY_DELAY ? parseInt(process.env.REQUEST_RETRY_DELAY, 10) : 7000; // 7s
class AttachmentProcessor {
    async getAttachment(url, responseType) {
        const storageType = AttachmentProcessor.getStorageTypeByUrl(url);
        const axConfig = {
            url,
            responseType,
            method: 'get',
            timeout: REQUEST_TIMEOUT,
            retry: REQUEST_MAX_RETRY,
            delay: REQUEST_RETRY_DELAY,
        };
        switch (storageType) {
            case 'steward': return AttachmentProcessor.getStewardAttachment(axConfig);
            case 'maester': return AttachmentProcessor.getMaesterAttachment(axConfig);
            default: throw new Error(`Storage type "${storageType}" is not supported`);
        }
    }
    async uploadAttachment(body) {
        logger.debug('Start uploading attachment');
        return axiosUploadAttachment(body);
    }
    static async getStewardAttachment(axConfig) {
        const ax = axios_1.default.create();
        AttachmentProcessor.addRetryCountInterceptorToAxios(ax);
        return ax(axConfig);
    }
    static async getMaesterAttachment(axConfig) {
        const client = new dist_1.StorageClient(maesterCreds);
        const objectStorage = new dist_1.ObjectStorage(maesterCreds, client);
        const maesterAttachmentId = AttachmentProcessor.getMaesterAttachmentIdByUrl(axConfig.url);
        const response = await objectStorage.getById(maesterAttachmentId, axConfig.responseType);
        return { data: response };
    }
    static getStorageTypeByUrl(urlString) {
        const url = new url_1.URL(urlString);
        const storageType = url.searchParams.get(exports.STORAGE_TYPE_PARAMETER);
        return storageType || exports.DEFAULT_STORAGE_TYPE;
    }
    static getMaesterAttachmentIdByUrl(urlString) {
        const { pathname } = new url_1.URL(urlString);
        const maesterAttachmentId = pathname.split(exports.MAESTER_OBJECT_ID_ENDPOINT)[1];
        if (!maesterAttachmentId) {
            throw new Error('Invalid Maester Endpoint');
        }
        return maesterAttachmentId;
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
            return new Promise((resolve) => setTimeout(() => resolve(ax(config)), config.delay));
        });
    }
}
exports.AttachmentProcessor = AttachmentProcessor;
// uploads attachment to "Maester" and applies request-retry logic
const axiosUploadAttachment = async (body, currentRetryCount = 0) => {
    var _a, _b;
    const data = new form_data_1.default();
    data.append('file', body);
    const config = {
        method: 'post',
        url: `${ELASTICIO_OBJECT_STORAGE_URI}${exports.MAESTER_OBJECT_ID_ENDPOINT}`,
        headers: {
            Authorization: `Bearer ${ELASTICIO_OBJECT_STORAGE_TOKEN}`,
            ...data.getHeaders()
        },
        timeout: REQUEST_TIMEOUT,
        maxRedirects: 0,
        data
    };
    try {
        const resp = await (0, axios_1.default)(config);
        return resp;
    }
    catch (error) {
        logger.error(`Error occurred: ${((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message}`);
        if ((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) {
            const { status } = error.response;
            logger.error(`error status: ${status}`);
            if (status >= 300 && status < 500)
                throw error;
        }
        if (currentRetryCount + 1 <= REQUEST_MAX_RETRY) {
            logger.debug(`Start retrying #${currentRetryCount + 1}`);
            await sleep(REQUEST_RETRY_DELAY);
            return axiosUploadAttachment(body, currentRetryCount + 1);
        }
        throw error;
    }
};
const sleep = async (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});
