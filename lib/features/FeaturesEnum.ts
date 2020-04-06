import { GzipRequestFeature } from './request';
import { Xml2JsonResponseFeature } from './response';
import { AbstractRequestFeature } from './request/AbstractRequestFeature';
import { AbstractResponseFeature } from './response/AbstractResponseFeature';

type RequestFeatureSubClass = { new(args?): AbstractRequestFeature };
type ResponseFeatureSubClass = { new(args?): AbstractResponseFeature } ;

export enum RequestFeature {
  Gzip
}

export enum ResponseFeature {
  Xml2Json,
  Upload2Attachment // TODO implement ResponseFeature using Attachment processor
}

export const FEATURES_MAP = new Map<RequestFeature|ResponseFeature, ResponseFeatureSubClass|RequestFeatureSubClass>();

FEATURES_MAP.set(RequestFeature.Gzip, GzipRequestFeature);
FEATURES_MAP.set(ResponseFeature.Xml2Json, Xml2JsonResponseFeature);
