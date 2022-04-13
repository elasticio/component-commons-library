import { NoAuthRestClient } from './NoAuthRestClient';

export class BasicAuthRestClient extends NoAuthRestClient {
  username: string;

  password: string;

  constructor(emitter, cfg) {
    super(emitter, cfg);
    this.username = cfg.username;
    this.password = cfg.password;
  }

  protected addAuthenticationToRequestOptions(requestOptions) {
    requestOptions.auth = {
      username: this.username,
      password: this.password,
    };
  }
}
