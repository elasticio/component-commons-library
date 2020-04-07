/* eslint-disable no-param-reassign,  no-underscore-dangle, class-methods-use-this */
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { RequestOptionsType, RestResponseType } from '../types';
import {
  MAX_REDIRECTS_COUNT, REQUEST_MAX_CONTENT_LENGTH, REQUEST_MAX_RETRY, REQUEST_RETRY_DELAY, REQUEST_TIMEOUT,
} from '../Constants';
import { addRetryCountInterceptorToAxios, prepareResponseStructure, processPromisesInSeqence } from '../helpers';
import { AbstractResponseFeature } from '../features/response/AbstractResponseFeature';
import { AbstractRequestFeature } from '../features/request/AbstractRequestFeature';
import { RequestFeature, ResponseFeature } from '../features';
import { GzipRequestFeature } from '../features/request';
import { Xml2JsonResponseFeature } from '../features/response';

type RequestFeatureSubClass = { new(args?): AbstractRequestFeature };
type ResponseFeatureSubClass = { new(args?): AbstractResponseFeature } ;

const REQUEST_FEATURES_MAP = new Map<RequestFeature, RequestFeatureSubClass>([
  [RequestFeature.Gzip, GzipRequestFeature],
]);

const RESPONSE_FEATURES_MAP = new Map<ResponseFeature, ResponseFeatureSubClass>([
  [ResponseFeature.Xml2Json, Xml2JsonResponseFeature],
]);

export class NoAuthRestClient {
  logger: any;

  emit: any;

  cfg: any;

  requestFeatures: Array<RequestFeatureSubClass>;

  responseFeatures: Array<RequestFeatureSubClass>;

  constructor(context, cfg) {
    this.logger = context.logger;
    this.emit = context.emit;
    this.cfg = cfg;
    this.requestFeatures = [];
    this.responseFeatures = [];
  }

  public registerRequestFeature(feature: RequestFeature) {
    const FeatureSubClass: RequestFeatureSubClass | undefined = REQUEST_FEATURES_MAP.get(feature);
    if (!FeatureSubClass) {
      throw new Error(`Feature: ${feature}, was not found`);
    }
    this.requestFeatures.push(FeatureSubClass);
  }

  public registerResponseFeature(feature: ResponseFeature) {
    const FeatureSubClass: ResponseFeatureSubClass | undefined = RESPONSE_FEATURES_MAP.get(feature);
    if (!FeatureSubClass) {
      throw new Error(`Feature: ${feature}, was not found`);
    }
    this.responseFeatures.push(FeatureSubClass);
  }

  public setRequestFeature(featuresList: Array<RequestFeature>) {
    this.requestFeatures = featuresList.map((feature) => {
      const FeatureSubClass: RequestFeatureSubClass | undefined = REQUEST_FEATURES_MAP.get(feature);
      if (!FeatureSubClass) {
        throw new Error(`Feature: ${feature}, was not found`);
      }
      return FeatureSubClass;
    });
  }

  public setResponseFeature(featuresList: Array<ResponseFeature>) {
    this.responseFeatures = featuresList.map((feature) => {
      const FeatureSubClass: RequestFeatureSubClass | undefined = RESPONSE_FEATURES_MAP.get(feature);
      if (!FeatureSubClass) {
        throw new Error(`Feature: ${feature}, was not found`);
      }
      return FeatureSubClass;
    });
  }

  public replaceDefaultResponseHandler(responseHandler) {
    this.handleRestResponse = responseHandler;
  }

  // @ts-ignore: no-unused-variable
  protected async addAuthenticationToRequestOptions(requestOptions) {
  }

  async makeRequest(options: RequestOptionsType): Promise<any> {
    const requestOptions: RequestOptionsType = {
      ...{
        rebound: false,
        maxRedirects: MAX_REDIRECTS_COUNT,
        gzip: false,
        useBaseURLFromConfig: true,
        maxContentLength: REQUEST_MAX_CONTENT_LENGTH,
        validateStatus: () => true,
        timeout: REQUEST_TIMEOUT,
      },
      ...options,
    };

    await processPromisesInSeqence(this.requestFeatures.map((FeatureClass) => {
      const feature: AbstractRequestFeature = new FeatureClass();
      return feature.apply(requestOptions);
    }));
    if (!this.cfg.followRedirect) {
      requestOptions.maxRedirects = 0;
    }

    if (requestOptions.useBaseURLFromConfig) {
      requestOptions.baseURL = this.cfg.baseURL;
    }
    const client = axios.create();
    this.addRebound(requestOptions, client);

    this.logger.info(`Making ${requestOptions.method} request to ${requestOptions.baseURL ? `baseURL: '${requestOptions.baseURL}' and to ` : ''}url: '${requestOptions.url}'`);
    this.logger.trace('Request options: %j', requestOptions);

    await this.addAuthenticationToRequestOptions(requestOptions);
    const response = await client(requestOptions);
    const checkedResponse = this.validateStatus(response);

    await processPromisesInSeqence(this.responseFeatures.map((FeatureClass) => {
      const feature: AbstractResponseFeature = new FeatureClass();
      return feature.apply(response);
    }));
    return this.handleRestResponse(checkedResponse);
  }

  private addRebound(requestOptions: RequestOptionsType, client: AxiosInstance) {
    if (requestOptions.rebound) {
      requestOptions.retry = REQUEST_MAX_RETRY;
      requestOptions.delay = REQUEST_RETRY_DELAY;
      addRetryCountInterceptorToAxios(client);
    }
  }

  protected validateStatus(response): AxiosResponse {
    const {
      status: statusCode, statusText, headers, data: body, config,
    } = response;
    this.logger.trace(`Response statusCode: ${statusCode}, statusText: ${statusText} body: %j, headers: %j`, body, headers);
    if (statusCode >= 400) {
      throw new Error(`Error in making request to ${config.url} Status code: ${statusCode}, Body: ${JSON.stringify(body)}`);
    }
    if (statusCode >= 300 && config.maxRedirects > 0) {
      response.statusText = 'Redirection error. Please enable redirect mode if You need to support redirecting in the request.';
      if (!this.cfg.dontThrowError) {
        const err = new Error(JSON.stringify(prepareResponseStructure(response)));
        err.name = 'HTTP redirection error';
        throw err;
      }
    }
    return response;
  }

  protected handleRestResponse(response: AxiosResponse): RestResponseType {
    const restResponse: RestResponseType = prepareResponseStructure(response);
    this.logger.trace('HTTP Response restResponse: %j');
    return restResponse;
  }
}
