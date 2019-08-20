import { convertJsonSchemaToEioSchema, makeSchemaInline } from './jsonSchema/jsonSchemaConversionUtil';
import { getLogger } from './logger/logger';

export { AttachmentProcessor } from './attachment/AttachmentProcessor';
export { ApiKeyRestClient } from './authentication/ApiKeyRestClient';
export { BasicAuthRestClient } from './authentication/BasicAuthRestClient';
export { NoAuthRestClient } from './authentication/NoAuthRestClient';
export { OAuth2RestClient } from './authentication/OAuth2AuthorizationCodeRestClient';

export class JsonSchema {
  static convertJsonSchemaToEioSchema = convertJsonSchemaToEioSchema;
  static makeSchemaInline = makeSchemaInline;
}

export class Logger {
  static getLogger = getLogger;
}
