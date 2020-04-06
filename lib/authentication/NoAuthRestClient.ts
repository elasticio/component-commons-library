/* eslint-disable no-param-reassign,  no-underscore-dangle, class-methods-use-this */
import removeTrailingSlash from 'remove-trailing-slash';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { RequestOptionsType } from '../types';
import {
  MAX_REDIRECTS_COUNT, REQUEST_MAX_CONTENT_LENGTH, REQUEST_MAX_RETRY, REQUEST_RETRY_DELAY, REQUEST_TIMEOUT,
} from '../Constants';
import { addRetryCountInterceptorToAxios, prepareResponseStructure, processPromisesInSeqence } from '../helpers';
import { RestResponseType } from '../types/RestResponseType';
import { AbstractResponseFeature } from '../features/response/AbstractResponseFeature';
import { AbstractRequestFeature } from '../features/request/AbstractRequestFeature';
import { FEATURES_MAP, RequestFeature, ResponseFeature } from '../features';

type RequestFeatureSubClass = { new(args?): AbstractRequestFeature };
type ResponseFeatureSubClass = { new(args?): AbstractResponseFeature } ;

export class NoAuthRestClient {
  logger: any;

  emit: any;

  cfg: any;

  requestFeatures: Array<{ new(): AbstractRequestFeature }>;

  responseFeatures: Array<ResponseFeatureSubClass>;

  constructor(context, cfg) {
    this.logger = context.logger;
    this.emit = context.emit;
    this.cfg = cfg;
    this.requestFeatures = [];
    this.responseFeatures = [];
  }

  public registerRequestFeature(feature: RequestFeature) {
    const FeatureSubClass: RequestFeatureSubClass = FEATURES_MAP[feature];
    this.requestFeatures.push(FeatureSubClass);
  }

  public registerResponseFeature(feature: ResponseFeature) {
    const FeatureSubClass: ResponseFeatureSubClass = FEATURES_MAP[feature];
    this.responseFeatures.push(FeatureSubClass);
  }

  public setRequestFeature(featuresList: Array<RequestFeature>) {
    this.requestFeatures = featuresList.map((feature) => FEATURES_MAP[feature]);
  }

  public setResponseFeature(featuresList: Array<ResponseFeature>) {
    this.responseFeatures = featuresList.map((feature) => FEATURES_MAP[feature]);
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

    if (options.useBaseURLFromConfig) {
      requestOptions.baseURL = this.cfg.baseURL;
    }
    if (requestOptions.baseURL) {
      requestOptions.baseURL = removeTrailingSlash(requestOptions.baseURL.trim()); // TODO Check if axios do not need removeTrailingSlash
    }
    const client = axios.create();
    this.addRebound(requestOptions, client);

    this.logger.info(`Making ${requestOptions.method} request to ${requestOptions.url}`);
    this.logger.trace('Request options: %j', requestOptions);

    await this.addAuthenticationToRequestOptions(requestOptions);
    const response = await client(requestOptions);
    const checkedResponse = this.validateStatus(response);

    await processPromisesInSeqence(this.responseFeatures.map((FeatureClass) => {
      const feature: AbstractResponseFeature = new FeatureClass();
      return feature.apply(response);
    }));

    this.handleRestResponse(checkedResponse);
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
      throw new Error(`Error in making request to ${response.request.uri.href} Status code: ${statusCode}, Body: ${JSON.stringify(body)}`);
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
