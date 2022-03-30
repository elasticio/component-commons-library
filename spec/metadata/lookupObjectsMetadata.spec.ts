import chai from 'chai';
import { readMetaFilter } from '../../src/metadata/lookupObjectsMetadata';

const { expect } = chai;

describe('Utils metadata resolver', () => {
  it('Retrieving object structure metadata with filter condition number = 3', async () => {
    expect(await readMetaFilter(3, ['ID', 'CallbackURL', 'ClientID'], undefined, undefined)).to.deep.equal(expectedFilterObject);
  });

  it('Retrieving object structure metadata with filter condition number = 0', async () => {
    expect(await readMetaFilter(0, ['ID', 'CallbackURL', 'ClientID'], undefined, undefined)).to.deep.equal({});
  });

  it('Retrieving object structure metadata with filter fieldNames undefined', async () => {
    try {
      await readMetaFilter(3, undefined, undefined, undefined);
      throw new Error('Test should fail');
    } catch (e: any) {
      expect(e.message).to.equal('Field names is required');
    }
  });

  it('Retrieving object structure metadata with filter fieldNames not array', async () => {
    try {
      await readMetaFilter(3, 'ID,Name', undefined, undefined);
      throw new Error('Test should fail');
    } catch (e: any) {
      expect(e.message).to.equal('Field Names should be array');
    }
  });

  it('Retrieving object structure metadata with filter conditions not array', async () => {
    try {
      await readMetaFilter(3, ['ID', 'Name'], 'and,or', undefined);
      throw new Error('Test should fail');
    } catch (e: any) {
      expect(e.message).to.equal('Conditions should be array');
    }
  });

  it('Retrieving object structure metadata with filter Criteria links not array', async () => {
    try {
      await readMetaFilter(3, ['ID', 'Name'], undefined, 'and,or');
      throw new Error('Test should fail');
    } catch (e: any) {
      expect(e.message).to.equal('Criteria links should be array');
    }
  });
});

const expectedFilterObject = {
  type: 'object',
  properties: {
    searchTerm1: {
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
          title: 'Condition',
          type: 'string',
          required: true,
          enum: ['eq', 'ne', 'gt', 'ge', 'lt', 'le'],
        },
        fieldValue: {
          title: 'Field Value',
          type: 'string',
          required: true,
        },
      },
    },
    criteriaLink1: {
      title: 'Criteria Link 1', type: 'string', required: true, enum: ['and', 'or'],
    },
    searchTerm2: {
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
          title: 'Condition',
          type: 'string',
          required: true,
          enum: ['eq', 'ne', 'gt', 'ge', 'lt', 'le'],
        },
        fieldValue: {
          title: 'Field Value',
          type: 'string',
          required: true,
        },
      },
    },
    criteriaLink2: {
      title: 'Criteria Link 2', type: 'string', required: true, enum: ['and', 'or'],
    },
    searchTerm3: {
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
          title: 'Condition',
          type: 'string',
          required: true,
          enum: ['eq', 'ne', 'gt', 'ge', 'lt', 'le'],
        },
        fieldValue: {
          title: 'Field Value',
          type: 'string',
          required: true,
        },
      },
    },
  },
};
