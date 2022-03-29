export function convertJsonSchemaToEioSchema(keyToReturn, completeSchemaOriginal) {
  const completeSchema = JSON.parse(JSON.stringify(completeSchemaOriginal));

  Object.keys(completeSchema).forEach((key) => {
    const jsonSchema = completeSchema[key];
    const requiredProperties = jsonSchema.required || [];
    requiredProperties.forEach((requiredProperty) => {
      jsonSchema.properties[requiredProperty].required = true;
    });

    if (Array.isArray(jsonSchema.required)) {
      jsonSchema.required = jsonSchema.required.length > 0;
    }

    // Populate omitted values to false for testing simplicity
    Object.keys(jsonSchema.properties).forEach((propertyName) => {
      jsonSchema.properties[propertyName].required = !!jsonSchema.properties[propertyName].required;
    });

    const properties = Object.keys(jsonSchema.properties);
    properties.forEach((propertyName) => {
      const property = jsonSchema.properties[propertyName];
      if (property.description && property.example) {
        property.title = `${propertyName} (${property.description} e.g. ${property.example})`;
      } else if (property.description) {
        property.title = `${propertyName} (${property.description})`;
      } else if (property.example) {
        property.title = `${propertyName} (e.g. ${property.example})`;
      } else {
        property.title = propertyName;
      }
      if (property.type === 'integer') {
        property.type = 'number';
      }
    });
  });

  return completeSchema[keyToReturn];
}

export function makeSchemaInline(json, availableSchemas) {
  if (Object.keys(json).indexOf('$ref') > -1) {
    const resolvation = availableSchemas[json.$ref];

    json.properties = resolvation.properties;
    if (resolvation.additionalProperties) {
      json.additionalProperties = resolvation.additionalProperties;
    }
    if (resolvation.id) {
      json.id = resolvation.id;
    }
    if (resolvation.description) {
      json.description = resolvation.description;
    }
    if (resolvation.title) {
      json.title = resolvation.title;
    }
    json.type = resolvation.type;
    delete json.$ref;
  }

  if (json.type === 'object') {
    if (json.properties) {
      Object.keys(json.properties).forEach((k) => {
        this.makeSchemaInline(json.properties[k], availableSchemas);
      });
    }
    if (json.additionalProperties) {
      this.makeSchemaInline(json.additionalProperties, availableSchemas);
    }
  }
  if (json.type === 'array') {
    this.makeSchemaInline(json.items, availableSchemas);
  }

  return json;
}

export function convertDotNetTypeToJsonSchemaType(dotNetType: string) : string {
  switch (dotNetType) {
    case 'System.String':
    case 'System.DateTime':
    case 'System.Guid':
      return 'string';
    case 'System.Int64':
    case 'System.Int32':
    case 'System.Int16':
    case 'System.Decimal':
    case 'System.Double':
      return 'number';
    case 'System.Boolean':
      return 'boolean';
    default:
      throw new Error(`Unrecognized Type: ${dotNetType}`);
  }
}
