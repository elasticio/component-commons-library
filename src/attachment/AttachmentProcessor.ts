/* eslint-disable class-methods-use-this */
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { URL } from 'url';
import { StorageClient, ObjectStorage } from '@elastic.io/maester-client/dist';
import FormData from 'form-data';
import { getLogger } from '../logger/logger';

const logger = getLogger();

export const STORAGE_TYPE_PARAMETER = 'storage_type';
export const DEFAULT_STORAGE_TYPE = 'steward';
export const MAESTER_OBJECT_ID_ENDPOINT = '/objects/';
const { ELASTICIO_OBJECT_STORAGE_TOKEN = '', ELASTICIO_OBJECT_STORAGE_URI = '' } = process.env;
const maesterCreds = { jwtSecret: ELASTICIO_OBJECT_STORAGE_TOKEN, uri: ELASTICIO_OBJECT_STORAGE_URI };
const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT ? parseInt(process.env.REQUEST_TIMEOUT, 10) : 10000; // 10s
const REQUEST_MAX_RETRY = process.env.REQUEST_MAX_RETRY ? parseInt(process.env.REQUEST_MAX_RETRY, 10) : 7; // 10s
const REQUEST_RETRY_DELAY = process.env.REQUEST_RETRY_DELAY ? parseInt(process.env.REQUEST_RETRY_DELAY, 10) : 7000; // 7s

export class AttachmentProcessor {
  async getAttachment(url: string, responseType: string) {
    const storageType = AttachmentProcessor.getStorageTypeByUrl(url);
    const axConfig = {
      url,
      responseType,
      method: 'get',
      timeout: REQUEST_TIMEOUT,
      retry: REQUEST_MAX_RETRY,
      delay: REQUEST_RETRY_DELAY,
    } as AxiosRequestConfig;

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
    const ax = axios.create();
    AttachmentProcessor.addRetryCountInterceptorToAxios(ax);
    return ax(axConfig);
  }

  static async getMaesterAttachment(axConfig) {
    const client = new StorageClient(maesterCreds);
    const objectStorage = new ObjectStorage(maesterCreds, client);
    const maesterAttachmentId = AttachmentProcessor.getMaesterAttachmentIdByUrl(axConfig.url);
    const response = await objectStorage.getById(maesterAttachmentId, axConfig.responseType);
    return { data: response };
  }

  static getStorageTypeByUrl(urlString) {
    const url = new URL(urlString);
    const storageType = url.searchParams.get(STORAGE_TYPE_PARAMETER);
    return storageType || DEFAULT_STORAGE_TYPE;
  }

  static getMaesterAttachmentIdByUrl(urlString): string {
    const { pathname } = new URL(urlString);
    const maesterAttachmentId = pathname.split(MAESTER_OBJECT_ID_ENDPOINT)[1];
    if (!maesterAttachmentId) {
      throw new Error('Invalid Maester Endpoint');
    }
    return maesterAttachmentId;
  }

  static addRetryCountInterceptorToAxios(ax) {
    ax.interceptors.response.use(undefined, (err) => { //  Retry count interceptor for axios
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

// uploads attachment to "Maester" and applies request-retry logic
const axiosUploadAttachment = async (body, currentRetryCount: number = 0) => {
  const data = new FormData();
  data.append('file', body);

  const config = {
    method: 'post',
    url: `${ELASTICIO_OBJECT_STORAGE_URI}${MAESTER_OBJECT_ID_ENDPOINT}`,
    headers: {
      Authorization: `Bearer ${ELASTICIO_OBJECT_STORAGE_TOKEN}`,
      ...data.getHeaders()
    },
    timeout: REQUEST_TIMEOUT,
    maxRedirects: 0,
    data
  };

  try {
    const resp = await axios(config);
    return resp;
  } catch (error) {
    logger.error(`Error occurred: ${error.response?.data || error.message}`);
    if (error.response?.status) {
      const { status } = error.response;
      logger.error(`error status: ${status}`);
      if (status >= 300 && status < 500) throw error;
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
