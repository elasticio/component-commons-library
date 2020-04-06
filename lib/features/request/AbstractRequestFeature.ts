import { RequestOptionsType } from '../../types';

export interface AbstractRequestFeature {
  apply(options: RequestOptionsType): RequestOptionsType;
}
