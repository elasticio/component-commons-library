import { AxiosResponse } from 'axios';
import { RequestOptionsType } from '../../types';

export abstract class AbstractResponseFeature {
  abstract apply(options: AxiosResponse): RequestOptionsType;
}
