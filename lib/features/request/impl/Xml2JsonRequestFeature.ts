import { AbstractRequestFeature } from '../AbstractRequestFeature';
import { xml2Json } from '../../../helpers';
import { RequestOptionsType } from '../../../types';

export class Xml2JsonRequestFeature implements AbstractRequestFeature {
  protected logger: any;

  constructor(logger) {
    this.logger = logger;
  }

  apply(options: RequestOptionsType): RequestOptionsType {
    if (options.data) {
      options.data = xml2Json(this.logger, options.data);
    }
    return options;
  }
}
