import axios, { AxiosRequestConfig } from 'axios';

const restNodeClient = require('elasticio-rest-node')();

import { REQUEST_TIMEOUT, REQUEST_ATTACHMENT_MAX_CONTENT_LENGTH, REQUEST_MAX_RETRY, REQUEST_RETRY_DELAY } from '../Constants';
import { addRetryCountInterceptorToAxios } from "../helpers";

export class AttachmentProcessor {

  async getAttachment(url: string, responseType: string) {
    const ax = axios.create();
    addRetryCountInterceptorToAxios(ax);

    const axConfig = {
      url,
      responseType,
      method: 'get',
      timeout: REQUEST_TIMEOUT,
      retry: REQUEST_MAX_RETRY,
      delay: REQUEST_RETRY_DELAY,
    } as AxiosRequestConfig;

    return ax(axConfig);
  }

  async uploadAttachment(body) {
    const putUrl = await AttachmentProcessor.preparePutUrl();
    const ax = axios.create();
    addRetryCountInterceptorToAxios(ax);

    const axConfig = {
      url: putUrl,
      data: body,
      method: 'put',
      timeout: REQUEST_TIMEOUT,
      retry: REQUEST_MAX_RETRY,
      delay: REQUEST_RETRY_DELAY,
      maxContentLength: REQUEST_ATTACHMENT_MAX_CONTENT_LENGTH,
    } as AxiosRequestConfig;

    return ax(axConfig);
  }

  static async preparePutUrl() {
    const signedUrl = await restNodeClient.resources.storage.createSignedUrl();
    return signedUrl.put_url;
  }
}
