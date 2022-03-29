import { NoAuthRestClient } from './NoAuthRestClient';

export class ApiKeyRestClient extends NoAuthRestClient {
  apiKeyHeaderName: string;
  apiKeyHeaderValue: string;

  constructor(emitter, cfg) {
    super(emitter, cfg);
    this.apiKeyHeaderName = cfg.apiKeyHeaderName;
    this.apiKeyHeaderValue = cfg.apiKeyHeaderValue;
  }

  protected addAuthenticationToRequestOptions(requestOptions) {
    requestOptions.headers[this.apiKeyHeaderName] = this.apiKeyHeaderValue;
  }
}
