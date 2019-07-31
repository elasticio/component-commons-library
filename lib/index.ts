import { convertJsonSchemaToEioSchema, makeSchemaInline } from './jsonSchema/jsonSchemaConversionUtil';
import { getLogger } from './logger/logger';

export class JsonSchema {
  static convertJsonSchemaToEioSchema = convertJsonSchemaToEioSchema;
  static makeSchemaInline = makeSchemaInline;
}

export class Logger {
  static getLogger = getLogger;
}
