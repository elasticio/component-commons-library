import { convertJsonSchemaToEioSchema, makeSchemaInline, convertDotNetTypeToJsonSchemaType } from './jsonSchema/jsonSchemaConversionUtil';
import { jsonataTransform } from './jsonataTransform/jsonataTransform';
import { getLogger } from './logger/logger';
export { AttachmentProcessor } from './attachment/AttachmentProcessor';
export { ApiKeyRestClient } from './authentication/ApiKeyRestClient';
export { BasicAuthRestClient } from './authentication/BasicAuthRestClient';
export { NoAuthRestClient } from './authentication/NoAuthRestClient';
export { NtlmRestClient } from './authentication/NtlmRestClient';
export { OAuth2RestClient } from './authentication/OAuth2AuthorizationCodeRestClient';
export { CookieRestClient } from './authentication/CookieRestClient';
export declare class JsonSchema {
    static convertJsonSchemaToEioSchema: typeof convertJsonSchemaToEioSchema;
    static makeSchemaInline: typeof makeSchemaInline;
    static convertDotNetTypeToJsonSchemaType: typeof convertDotNetTypeToJsonSchemaType;
}
export declare class JsonataTransform {
    static jsonataTransform: typeof jsonataTransform;
}
export declare class Logger {
    static getLogger: typeof getLogger;
}
//# sourceMappingURL=index.d.ts.map