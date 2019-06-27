/* eslint-disable no-return-assign */
const fs = require('fs');
const chai = require('chai');

const { expect } = chai;
const { JsonSchema } = require('../../lib/index.js');

describe('Metadata converting ', () => {
  it('JSON schema to EIO metadata', async () => {
    const inputMetadata = JSON.parse(fs.readFileSync('spec/jsonSchema/samples/inputSchema.json')
      .toString());

    const result = JsonSchema.convertJsonSchemaToEioSchema('Product', inputMetadata);
    expect(result).to.deep.eql(JSON.parse(fs.readFileSync(
      'spec/jsonSchema/samples/outputSchema.json',
    )));
  });

  describe('Remove refs ', () => {
    it('for FULL Json', async () => {
      const inputMetadata = JSON.parse(fs.readFileSync(
        'spec/jsonSchema/samples/refsSchemaExample.json',
      )
        .toString());
      const listToResolve = JSON.parse(fs.readFileSync(
        'spec/jsonSchema/samples/schemasListToResolveExample.json',
      )
        .toString());

      JsonSchema.makeSchemaInline(inputMetadata, listToResolve);
      expect(inputMetadata).to.deep.eql(JSON.parse(fs.readFileSync(
        'spec/jsonSchema/samples/removingRefsResult.json',
      )));
    });

    it('for level one object', async () => {
      const inputMetadata = { type: 'object', properties: { nameholder: { $ref: 'Resolve' } } };
      const listToResolve = {
        Resolve: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      };

      JsonSchema.makeSchemaInline(inputMetadata, listToResolve);

      expect(inputMetadata).to.deep.eql({
        type: 'object',
        properties: {
          nameholder: {
            type: 'object',
            properties: { name: { type: 'string' } },
          },
        },
      });
    });

    it('for level one array', async () => {
      const inputMetadata = { type: 'array', items: { $ref: 'Resolve' } };
      const listToResolve = {
        Resolve: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      };

      JsonSchema.makeSchemaInline(inputMetadata, listToResolve);

      expect(inputMetadata).to.deep.eql({
        type: 'array',
        items: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      });
    });

    it('for level one additional properties', async () => {
      const inputMetadata = { type: 'object', additionalProperties: { $ref: 'Resolve' } };
      const listToResolve = {
        Resolve: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      };

      JsonSchema.makeSchemaInline(inputMetadata, listToResolve);

      expect(inputMetadata).to.deep.eql({
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      });
    });

    it('for level two object', async () => {
      const inputMetadata = { type: 'object', properties: { resolve1: { $ref: 'Resolve1' } } };
      const listToResolve = {
        Resolve1: {
          type: 'object',
          properties: { resolve2: { $ref: 'Resolve2' } },
        },
        Resolve2: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      };

      JsonSchema.makeSchemaInline(inputMetadata, listToResolve);

      expect(inputMetadata).to.deep.eql({
        type: 'object',
        properties: {
          resolve1: {
            type: 'object',
            properties: {
              resolve2: {
                type: 'object',
                properties: { name: { type: 'string' } },
              },
            },
          },
        },
      });
    });
  });
});
