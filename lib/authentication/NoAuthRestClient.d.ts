export declare class NoAuthRestClient {
    emitter: any;
    cfg: any;
    request: any;
    constructor(emitter: any, cfg: any);
    protected addAuthenticationToRequestOptions(requestOptions: any): void;
    protected handleRestResponse(response: any): any;
    makeRequest(options: any): Promise<any>;
}
//# sourceMappingURL=NoAuthRestClient.d.ts.map