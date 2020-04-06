import { AxiosResponse } from 'axios';
import { AbstractResponseFeature } from '../AbstractResponseFeature';
import { xml2Json } from '../../../helpers';

export class Xml2JsonResponseFeature implements AbstractResponseFeature {
  protected logger: any;

  constructor(logger) {
    this.logger = logger;
  }

  apply(response: AxiosResponse): AxiosResponse {
    if (response.data) {
      response.data = xml2Json(this.logger, response.data);
    }
    return response;
  }
}
