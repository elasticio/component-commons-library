import { NoAuthRestClient } from './NoAuthRestClient';
export declare class OAuth2RestClient extends NoAuthRestClient {
    private fetchNewToken;
    private getValidToken;
    protected addAuthenticationToRequestOptions(requestOptions: any): Promise<void>;
}
//# sourceMappingURL=OAuth2AuthorizationCodeRestClient.d.ts.map