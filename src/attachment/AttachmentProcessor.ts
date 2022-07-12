/* eslint-disable class-methods-use-this */
import axios, { AxiosRequestConfig } from 'axios';
import { URL } from 'url';
import { StorageClient, ObjectStorage } from '@elastic.io/maester-client';
import { RetryOptions, ResponseType, CONTENT_TYPE_HEADER } from '@elastic.io/maester-client/dist/src/interfaces';
import { Readable } from 'stream';
import { getLogger } from '../logger/logger';

const logger = getLogger();

export const STORAGE_TYPE_PARAMETER = 'storage_type';
export const DEFAULT_STORAGE_TYPE = 'steward';
export const MAESTER_OBJECT_ID_ENDPOINT = '/objects/';
const { ELASTICIO_OBJECT_STORAGE_TOKEN = '', ELASTICIO_OBJECT_STORAGE_URI = '' } = process.env;
const maesterCreds = { jwtSecret: ELASTICIO_OBJECT_STORAGE_TOKEN, uri: ELASTICIO_OBJECT_STORAGE_URI };
const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT ? parseInt(process.env.REQUEST_TIMEOUT, 10) : 30000; // 30s timeout
const REQUEST_MAX_RETRY = process.env.REQUEST_MAX_RETRY ? parseInt(process.env.REQUEST_MAX_RETRY, 10) : 7; // 7 times could be retried

export class AttachmentProcessor {
  async getAttachment(url: string, responseType: string) {
    const storageType = this.getStorageTypeByUrl(url);
    const axConfig = {
      url,
      responseType,
      method: 'get',
      timeout: REQUEST_TIMEOUT,
      retry: REQUEST_MAX_RETRY,
    } as AxiosRequestConfig;

    switch (storageType) {
      case 'steward': return this.getStewardAttachment(axConfig);
      case 'maester': return this.getMaesterAttachment(axConfig as any);
      default: throw new Error(`Storage type "${storageType}" is not supported`);
    }
  }

  async uploadAttachment(getAttachment: () => Promise<Readable>, retryOptions: RetryOptions = {}, contentType?: string) {
    logger.debug('uploading attachment..');
    const headers = {};
    if (contentType) headers[CONTENT_TYPE_HEADER] = contentType;
    const objectStorage = new ObjectStorage(maesterCreds);
    return objectStorage.add(getAttachment, {
      headers,
      retryOptions: {
        retriesCount: retryOptions.retriesCount || REQUEST_MAX_RETRY,
        requestTimeout: retryOptions.requestTimeout || REQUEST_TIMEOUT
      },
    });
  }

  getMaesterAttachmentUrlById(attachmentId): string {
    return `${maesterCreds.uri}${MAESTER_OBJECT_ID_ENDPOINT}${attachmentId}?${STORAGE_TYPE_PARAMETER}=maester`;
  }

  private async getStewardAttachment(axConfig) {
    const ax = axios.create();
    this.addRetryCountInterceptorToAxios(ax);
    return ax(axConfig);
  }

  private async getMaesterAttachment({ url, responseType }: { url: string, responseType: ResponseType }) {
    const client = new StorageClient(maesterCreds);
    const objectStorage = new ObjectStorage(maesterCreds, client);
    const maesterAttachmentId = this.getMaesterAttachmentIdByUrl(url);
    const response = await objectStorage.getOne(maesterAttachmentId, { responseType });
    return { data: response };
  }

  private getStorageTypeByUrl(urlString) {
    const url = new URL(urlString);
    const storageType = url.searchParams.get(STORAGE_TYPE_PARAMETER);
    return storageType || DEFAULT_STORAGE_TYPE;
  }

  private getMaesterAttachmentIdByUrl(urlString): string {
    const { pathname } = new URL(urlString);
    const maesterAttachmentId = pathname.split(MAESTER_OBJECT_ID_ENDPOINT)[1];
    if (!maesterAttachmentId) {
      throw new Error('Invalid Maester Endpoint');
    }
    return maesterAttachmentId;
  }

  private addRetryCountInterceptorToAxios(ax) {
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
