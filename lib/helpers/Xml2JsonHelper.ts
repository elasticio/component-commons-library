import xml2js from 'xml2js-es6-promise';

export async function xml2Json(logger, xmlString: String, inputOptions?): Promise<any> {
  logger.info('About to start parsing as Xml...');
  logger.trace('Xml string: %s', xmlString);
  const parserOptions = {
    ...{
      trim: false,
      normalize: false,
      explicitArray: false,
      normalizeTags: false,
      attrkey: '_attr',
      tagNameProcessors: [
        (name) => name.replace(':', '-'),
      ],
    },
    ...inputOptions,
  };
  const outputJson = await xml2js(xmlString, parserOptions);
  logger.info('Successfully parsed input Xml string');
  logger.trace('Output Json: %j', outputJson);
  return outputJson;
}
