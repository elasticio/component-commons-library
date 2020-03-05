import { NoAuthRestClient } from './NoAuthRestClient';
const ntlmRequest = require('ntlm-client').request;

export class NtlmRestClient extends NoAuthRestClient {
  constructor(emitter, cfg) {
    super(emitter, cfg);
    this.request = async function (requestOptions) {
      // eslint-disable-next-line no-return-await
      const { response } = await ntlmRequest({
        username: cfg.username,
        password: cfg.password,
        uri: requestOptions.url,
        method: requestOptions.method,
        request: {
          json: requestOptions.json,
          body: requestOptions.body,
          headers: requestOptions.headers,
        },
      });
      return response;
    };
  }
}
