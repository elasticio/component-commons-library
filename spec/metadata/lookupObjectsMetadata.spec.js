/* eslint-disable no-use-before-define */

const chai = require('chai');

const { expect } = chai;
const util = require('../../lib/metadata/lookupObjectsMetadata');

describe('Utils metadata resolver', () => {
  it('Retrieving object structure metadata with filter condition number = 3', async () => {
    expect(await util.readMetaFilter(3, ['ID', 'CallbackURL', 'ClientID'])).to.deep.eql(expectedFilterObject);
  });

  it('Retrieving object structure metadata with filter condition number = 0', async () => {
    expect(await util.readMetaFilter(0, ['ID', 'CallbackURL', 'ClientID'])).to.deep.eql({});
  });

  it('Retrieving object structure metadata with filter condition number = undefined', async () => {
    expect(await util.readMetaFilter(undefined, ['ID', 'CallbackURL', 'ClientID'])).to.deep.eql({});
  });

  it('Retrieving object structure metadata with filter fieldNames undefined', async () => {
    try {
      await util.readMetaFilter(3);
      throw new Error('Test should fail');
    } catch (e) {
      expect(e.message).to.eql('Field names is required');
    }
  });

  it('Retrieving object structure metadata with filter fieldNames not array', async () => {
    try {
      await util.readMetaFilter(3, 'ID,Name');
      throw new Error('Test should fail');
    } catch (e) {
      expect(e.message).to.eql('Field Names should be array');
    }
  });

  it('Retrieving object structure metadata with filter conditions not array', async () => {
    try {
      await util.readMetaFilter(3, ['ID', 'Name'], 'and,or');
      throw new Error('Test should fail');
    } catch (e) {
      expect(e.message).to.eql('Conditions should be array');
    }
  });

  it('Retrieving object structure metadata with filter Criteria links not array', async () => {
    try {
      await util.readMetaFilter(3, ['ID', 'Name'], undefined, 'and,or');
      throw new Error('Test should fail');
    } catch (e) {
      expect(e.message).to.eql('Criteria links should be array');
    }
  });
});

const expectedFilterObject = {
  type: 'object',
  properties:
    {
      searchTerm1:
        {
          title: 'Search term 1',
          type: 'object',
          properties: {
            fieldName: {
              title: 'Field Name',
              type: 'string',
              required: true,
              enum: ['ID',
                'CallbackURL',
                'ClientID'],
            },
            condition: {
              title: 'Condition', type: 'string', required: true, enum: ['eq', 'ne', 'gt', 'ge', 'lt', 'le'],
            },
            fieldValue:
              {
                title: 'Field Value',
                type: 'string',
                required: true,
              },
          },
        },
      criteriaLink1: {
        title: 'Criteria Link 1', type: 'string', required: true, enum: ['and', 'or'],
      },
      searchTerm2:
        {
          title: 'Search term 2',
          type: 'object',
          properties: {
            fieldName: {
              title: 'Field Name',
              type: 'string',
              required: true,
              enum: ['ID',
                'CallbackURL',
                'ClientID'],
            },
            condition: {
              title: 'Condition', type: 'string', required: true, enum: ['eq', 'ne', 'gt', 'ge', 'lt', 'le'],
            },
            fieldValue:
              {
                title: 'Field Value',
                type: 'string',
                required: true,
              },
          },
        },
      criteriaLink2: {
        title: 'Criteria Link 2', type: 'string', required: true, enum: ['and', 'or'],
      },
      searchTerm3:
        {
          title: 'Search term 3',
          type: 'object',
          properties: {
            fieldName: {
              title: 'Field Name',
              type: 'string',
              required: true,
              enum: ['ID',
                'CallbackURL',
                'ClientID'],
            },
            condition: {
              title: 'Condition', type: 'string', required: true, enum: ['eq', 'ne', 'gt', 'ge', 'lt', 'le'],
            },
            fieldValue:
              {
                title: 'Field Value',
                type: 'string',
                required: true,
              },
          },
        },
    },
};
