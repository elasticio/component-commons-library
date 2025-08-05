/* eslint-disable max-classes-per-file */
import { convertJsonSchemaToEioSchema, makeSchemaInline, convertDotNetTypeToJsonSchemaType } from './jsonSchema/jsonSchemaConversionUtil';
import { jsonataTransform } from './jsonataTransform/jsonataTransform';
import { getLogger } from './logger/logger';

export { AttachmentProcessor } from './attachment/AttachmentProcessor';

export { PlatformApiLogicClient } from './platformApi/PlatformApiLogicClient';
export { PlatformApiRestClient } from './platformApi/PlatformApiRestClient';
export * from './externalApi';
export * from './utils/utils';

export class JsonSchema {
  static convertJsonSchemaToEioSchema = convertJsonSchemaToEioSchema;

  static makeSchemaInline = makeSchemaInline;

  static convertDotNetTypeToJsonSchemaType = convertDotNetTypeToJsonSchemaType;
}

export class JsonataTransform {
  static jsonataTransform = jsonataTransform;
}

export class Logger {
  static getLogger = getLogger;
}

exports.getLogger = getLogger;
