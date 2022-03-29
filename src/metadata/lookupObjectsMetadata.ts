const CONDITION_ENUM = ['eq', 'ne', 'gt', 'ge', 'lt', 'le'];
const CRITERIA_LINK_ENUM = ['and', 'or'];

function getValidConditionNumber(cfgConditionNumber) {
  let conditionNumber = 0;
  if (cfgConditionNumber) {
    conditionNumber = Number(cfgConditionNumber);
    if (conditionNumber && Number.isInteger(conditionNumber)) {
      if (conditionNumber < 0) {
        throw Error('Number of search terms need to be positive integer value');
      }
      if (conditionNumber > 100) conditionNumber = 100;
    } else throw Error('Number of search terms need to be positive integer value');
  }
  return conditionNumber;
}

function verifiedIsArrayOfString(arrayOfString, objectName) {
  if (!Array.isArray(arrayOfString)) {
    throw new Error(`${objectName} should be array`);
  } else {
    arrayOfString.forEach((item) => {
      if (typeof item !== 'string') {
        throw new Error(`${objectName} should be array of string`);
      }
    });
  }
}

function verifiedInputParameters(fieldNames, conditions, criteriaLinks) {
  if (fieldNames) {
    verifiedIsArrayOfString(fieldNames, 'Field Names');
    if (conditions) {
      verifiedIsArrayOfString(conditions, 'Conditions');
    }
    if (criteriaLinks) {
      verifiedIsArrayOfString(criteriaLinks, 'Criteria links');
    }
  } else {
    throw new Error('Field names is required');
  }
}

export async function readMetaFilter(condNumber: number, fieldNames, conditions, criteriaLinks) {
  try {
    verifiedInputParameters(fieldNames, conditions, criteriaLinks);
  } catch (e) {
    throw e;
  }
  const conditionEnum = conditions || CONDITION_ENUM;
  const criteriaLinkEnum = criteriaLinks || CRITERIA_LINK_ENUM;
  const conditionNumber = getValidConditionNumber(condNumber);
  if (conditionNumber === 0) {
    return {};
  }
  const metaDataTemplate = {
    type: 'object',
    properties:
          {},
  };
  const properties = {};
  for (let i = 1; i <= conditionNumber; i += 1) {
    properties[`searchTerm${i}`] = {
      title: `Search term ${i}`,
      type: 'object',
      properties: {
        fieldName:
        {
          title: 'Field Name',
          type: 'string',
          required: true,
          enum: fieldNames,
        },
        condition:
        {
          title: 'Condition',
          type: 'string',
          required: true,
          enum: conditionEnum,
        },
        fieldValue:
        {
          title: 'Field Value',
          type: 'string',
          required: true,
        },
      },
    };
    if (conditionNumber !== i) {
      properties[`criteriaLink${i}`] = {
        title: `Criteria Link ${i}`,
        type: 'string',
        required: true,
        enum: criteriaLinkEnum,
      };
    }
  }
  metaDataTemplate.properties = properties;
  return metaDataTemplate;
}
