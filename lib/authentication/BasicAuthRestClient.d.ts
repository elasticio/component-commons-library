import { NoAuthRestClient } from './NoAuthRestClient';
export declare class BasicAuthRestClient extends NoAuthRestClient {
    username: string;
    password: string;
    constructor(emitter: any, cfg: any);
    protected addAuthenticationToRequestOptions(requestOptions: any): void;
}
//# sourceMappingURL=BasicAuthRestClient.d.ts.map