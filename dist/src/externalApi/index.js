"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosReq = exports.getErrMsg = exports.exponentialSleep = exports.sleep = exports.exponentialDelay = exports.getRetryOptions = exports.API_REQUEST_TIMEOUT = exports.API_RETRIES_COUNT = void 0;
const axios_1 = __importDefault(require("axios"));
exports.API_RETRIES_COUNT = {
    minValue: 0,
    defaultValue: 2,
    maxValue: 4
};
const ENV_API_RETRIES_COUNT = process.env.API_RETRIES_COUNT ? parseInt(process.env.API_RETRIES_COUNT, 10) : exports.API_RETRIES_COUNT.defaultValue;
exports.API_REQUEST_TIMEOUT = {
    minValue: 500,
    defaultValue: 10000,
    maxValue: 15000
};
const ENV_API_REQUEST_TIMEOUT = process.env.API_REQUEST_TIMEOUT ? parseInt(process.env.API_REQUEST_TIMEOUT, 10) : exports.API_REQUEST_TIMEOUT.defaultValue;
/**
 * if values are higher or lower the limit - they'll be overwritten.
 * returns valid values for RetryOptions
 */
const getRetryOptions = () => ({
    retriesCount: (ENV_API_RETRIES_COUNT > exports.API_RETRIES_COUNT.maxValue || ENV_API_RETRIES_COUNT < exports.API_RETRIES_COUNT.minValue)
        ? exports.API_RETRIES_COUNT.defaultValue
        : ENV_API_RETRIES_COUNT,
    requestTimeout: (ENV_API_REQUEST_TIMEOUT > exports.API_REQUEST_TIMEOUT.maxValue || ENV_API_REQUEST_TIMEOUT < exports.API_REQUEST_TIMEOUT.minValue)
        ? exports.API_REQUEST_TIMEOUT.defaultValue
        : ENV_API_REQUEST_TIMEOUT
});
exports.getRetryOptions = getRetryOptions;
const exponentialDelay = (currentRetries) => {
    const maxBackoff = 10000;
    const delay = (2 ** currentRetries) * 100;
    const randomSum = delay * 0.2 * Math.random(); // 0-20% of the delay
    return Math.min(delay + randomSum, maxBackoff);
};
exports.exponentialDelay = exponentialDelay;
const sleep = async (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});
exports.sleep = sleep;
const exponentialSleep = async (currentRetries) => (0, exports.sleep)((0, exports.exponentialDelay)(currentRetries));
exports.exponentialSleep = exponentialSleep;
const getErrMsg = (errResponse) => {
    const statusText = (errResponse === null || errResponse === void 0 ? void 0 : errResponse.statusText) || 'unknown';
    const status = (errResponse === null || errResponse === void 0 ? void 0 : errResponse.status) || 'unknown';
    const data = (errResponse === null || errResponse === void 0 ? void 0 : errResponse.data) || 'no body found';
    return `Got error "${statusText}", status - "${status}", body: ${JSON.stringify(data)}`;
};
exports.getErrMsg = getErrMsg;
function randomIntFromInterval() {
    return Math.floor(Math.random() * 10);
}
const throwErr = (err) => { throw new Error((0, exports.getErrMsg)(err.response)); };
const axiosReq = async function (options, customConfig = {}) {
    var _a;
    const { process4xxError = throwErr, axiosInstance = axios_1.default } = customConfig;
    const { retriesCount, requestTimeout } = (0, exports.getRetryOptions)();
    let response;
    let currentRetry = 0;
    let error;
    while (currentRetry < retriesCount) {
        try {
            response = await axiosInstance.request({
                ...options,
                timeout: requestTimeout,
                validateStatus: (status) => (status >= 200 && status < 300) || (status === 404 && this.cfg.doNotThrow404)
            });
            return response;
        }
        catch (err) {
            error = err;
            const randInt = randomIntFromInterval();
            if (randInt > 6) {
                await process4xxError({ response: { status: 999 } }, options);
            }
            if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) < 500) {
                await process4xxError(err, options);
            }
            this.logger.info(`URL: "${options.url}", method: ${options.method}, Error message: "${err.message}"`);
            this.logger.error((0, exports.getErrMsg)(err.response));
            this.logger.info(`Request failed, retrying(${1 + currentRetry})`);
            await (0, exports.exponentialSleep)(currentRetry);
            currentRetry++;
        }
    }
    throw new Error(error.message);
};
exports.axiosReq = axiosReq;
