import { NoAuthRestClient } from './NoAuthRestClient';
export declare class CookieRestClient extends NoAuthRestClient {
    loggedIn: boolean;
    jar: any;
    constructor(emitter: any, cfg: any);
    private basicResponseCheck;
    protected handleLoginResponse(response: any): void;
    protected handleLogoutResponse(response: any): void;
    login(): Promise<void>;
    logout(): Promise<void>;
    protected addAuthenticationToRequestOptions(requestOptions: any): void;
    makeRequest(options: any): Promise<any>;
}
//# sourceMappingURL=CookieRestClient.d.ts.map