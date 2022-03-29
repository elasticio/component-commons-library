import axios, { AxiosRequestConfig } from 'axios';
import { URL } from 'url';
import { StorageClient, ObjectStorage } from '@elastic.io/maester-client/dist';

export const STORAGE_TYPE_PARAMETER = 'storage_type';
export const DEFAULT_STORAGE_TYPE = 'steward';
export const MAESTER_OBJECT_ID_ENDPOINT = '/objects/';
const { ELASTICIO_OBJECT_STORAGE_TOKEN = '', ELASTICIO_OBJECT_STORAGE_URI = '' } = process.env;
const maesterCreds = { jwtSecret: ELASTICIO_OBJECT_STORAGE_TOKEN, uri: ELASTICIO_OBJECT_STORAGE_URI };
const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT ? parseInt(process.env.REQUEST_TIMEOUT, 10) : 10000; // 10s
const REQUEST_MAX_RETRY = process.env.REQUEST_MAX_RETRY ? parseInt(process.env.REQUEST_MAX_RETRY, 10) : 7; // 10s
const REQUEST_RETRY_DELAY = process.env.REQUEST_RETRY_DELAY ? parseInt(process.env.REQUEST_RETRY_DELAY, 10) : 7000; // 7s
const REQUEST_MAX_BODY_LENGTH = process.env.REQUEST_MAX_BODY_LENGTH ? parseInt(process.env.REQUEST_MAX_BODY_LENGTH, 10) : 104857600; // 100MB

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

  async uploadAttachment(body, contentType) {
    const ax = axios.create();
    AttachmentProcessor.addRetryCountInterceptorToAxios(ax);
    const url = `${ELASTICIO_OBJECT_STORAGE_URI}${MAESTER_OBJECT_ID_ENDPOINT}`;

    const axConfig = {
      url,
      data: body,
      method: 'post',
      headers: {
        Authorization: `Bearer ${ELASTICIO_OBJECT_STORAGE_TOKEN}`,
        'Content-Type': contentType,
      },
      timeout: REQUEST_TIMEOUT,
      retry: REQUEST_MAX_RETRY,
      delay: REQUEST_RETRY_DELAY,
      maxBodyLength: REQUEST_MAX_BODY_LENGTH,
    } as AxiosRequestConfig;

    return ax(axConfig);
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
      return new Promise(resolve => setTimeout(() => resolve(ax(config)), config.delay));
    });
  }
}
