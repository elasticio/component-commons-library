export declare class AttachmentProcessor {
    getAttachment(url: string, responseType: string): Promise<import("axios").AxiosResponse<any>>;
    uploadAttachment(body: any): Promise<import("axios").AxiosResponse<any>>;
    static preparePutUrl(): Promise<any>;
    static addRetryCountInterceptorToAxios(ax: any): void;
}
//# sourceMappingURL=AttachmentProcessor.d.ts.map