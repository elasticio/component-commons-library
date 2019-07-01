/* eslint-disable global-require */

module.exports = {
  JsonSchema: {
    convertJsonSchemaToEioSchema: require('./jsonSchema/jsonSchemaConversionUtil').convertJsonSchemaToEioSchema,
    makeSchemaInline: require('./jsonSchema/jsonSchemaConversionUtil').makeSchemaInline,
  },
  Logger: {
    getLogger: require('./logger/logger'),
  },
};
