import { AxiosRequestConfig } from 'axios';
import packageJson from '../../package.json';
import { axiosReqWithRetryOnServerError } from '../externalApi/index';

const axiosVersion = packageJson.dependencies.axios;

export class PlatformApiRestClient {
  usingTaskUser: boolean;

  private readonly userAgentHeaders: { 'User-Agent': string, ['x-request-id']: string };

  private readonly msgId: string;

  private readonly logger: any;

  private readonly username: string;

  private readonly password: string;

  private readonly baseUrl: string;

  constructor(emitter, cfg, userAgent?: string, msgId?: string) {
    if (!!cfg.email !== !!cfg.apiKey) {
      throw new Error('Either both Email and API Key need to be provided or neither should be provided.');
    }
    if (!!cfg.url && (!cfg.email || !cfg.apiKey)) {
      throw new Error('If providing a Platform Instance URL, then an Email and API Key need to be provided as well.');
    }
    const baseUrl = (cfg.url || process.env.ELASTICIO_API_URI).trim().replace(/\/$/g, '');
    this.baseUrl = `${baseUrl}/v2`;
    this.username = cfg.email || process.env.ELASTICIO_API_USERNAME;
    this.password = cfg.apiKey || process.env.ELASTICIO_API_KEY;
    this.logger = emitter.logger;

    this.usingTaskUser = !cfg.email;
    this.logger.debug(`Will connect to ${baseUrl} as ${this.usingTaskUser ? 'task' : 'specified'} user`);
    this.msgId = msgId;
    this.userAgentHeaders = {
      'User-Agent': `${userAgent || ''} axios/${axiosVersion}`,
      'x-request-id': `f:${process.env.ELASTICIO_FLOW_ID};s:${process.env.ELASTICIO_STEP_ID};m:${this.msgId}`,
    };
  }

  async makeRequest(options) {
    const { url, method, body, headers = {} } = options;

    this.logger.debug(`Making ${method} request...`);

    const requestOptions: AxiosRequestConfig = {
      method,
      baseURL: this.baseUrl,
      url: url.trim(),
      data: body,
      headers: {
        ...headers,
        ...this.userAgentHeaders,
      },
      auth: {
        username: this.username,
        password: this.password,
      },
    };

    const response = await axiosReqWithRetryOnServerError(requestOptions, undefined, this.logger);

    return response.data;
  }
}
