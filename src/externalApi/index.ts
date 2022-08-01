import { AxiosResponse } from 'axios';

export interface RetryOptions {
  retriesCount?: number; // values are validated with API_RETRIES_COUNT const below
  requestTimeout?: number; // values are validated with API_REQUEST_TIMEOUT const below
}

export const API_RETRIES_COUNT = {
  minValue: 0,
  defaultValue: 2,
  maxValue: 4
} as const;
const ENV_API_RETRIES_COUNT = process.env.API_RETRIES_COUNT ? parseInt(process.env.API_RETRIES_COUNT, 10) : API_RETRIES_COUNT.defaultValue;

export const API_REQUEST_TIMEOUT = {
  minValue: 500,
  defaultValue: 10000,
  maxValue: 15000
} as const;
const ENV_API_REQUEST_TIMEOUT = process.env.API_REQUEST_TIMEOUT ? parseInt(process.env.API_REQUEST_TIMEOUT, 10) : API_REQUEST_TIMEOUT.defaultValue;

/**
 * if values are higher or lower the limit - they'll be overwritten.
 * returns valid values for RetryOptions
 */
export const getRetryOptions = (): RetryOptions => ({
  retriesCount: (ENV_API_RETRIES_COUNT > API_RETRIES_COUNT.maxValue || ENV_API_RETRIES_COUNT < API_RETRIES_COUNT.minValue)
    ? API_RETRIES_COUNT.defaultValue
    : ENV_API_RETRIES_COUNT,
  requestTimeout: (ENV_API_REQUEST_TIMEOUT > API_REQUEST_TIMEOUT.maxValue || ENV_API_REQUEST_TIMEOUT < API_REQUEST_TIMEOUT.minValue)
    ? API_REQUEST_TIMEOUT.defaultValue
    : ENV_API_REQUEST_TIMEOUT
});

export const exponentialDelay = (currentRetries: number) => {
  const maxBackoff = 10000;
  const delay = (2 ** currentRetries) * 100;
  const randomSum = delay * 0.2 * Math.random(); // 0-20% of the delay
  return Math.min(delay + randomSum, maxBackoff);
};

export const sleep = async (ms: number) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

export const exponentialSleep = async (currentRetries: number) => sleep(exponentialDelay(currentRetries));

export const getErrMsg = (errResponse: AxiosResponse) => {
  const statusText = errResponse?.statusText || 'unknown';
  const status = errResponse?.status || 'unknown';
  const data = errResponse?.data || 'no body found';
  return `Got error "${statusText}", status - "${status}", body: ${JSON.stringify(data)}`;
};
