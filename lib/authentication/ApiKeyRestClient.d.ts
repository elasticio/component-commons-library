import { NoAuthRestClient } from './NoAuthRestClient';
export declare class ApiKeyRestClient extends NoAuthRestClient {
    apiKeyHeaderName: string;
    apiKeyHeaderValue: string;
    constructor(emitter: any, cfg: any);
    protected addAuthenticationToRequestOptions(requestOptions: any): void;
}
//# sourceMappingURL=ApiKeyRestClient.d.ts.map