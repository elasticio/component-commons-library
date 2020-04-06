import { AbstractRequestFeature } from '../AbstractRequestFeature';
import { RequestOptionsType } from '../../../types';

export class GzipRequestFeature implements AbstractRequestFeature {
  apply(options: RequestOptionsType): RequestOptionsType {
    if (!options.headers['accept-encoding']) {
      options.headers['accept-encoding'] = 'gzip, deflate';
    }
    return options;
  }
}
