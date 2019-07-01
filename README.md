# component-commons-library

## Description

Library for most common component development cases

## JsonSchema converter

Contains tools for EIO json metadata generation

``` convertJsonSchemaToEioSchema(keyToReturn, completeSchemaOriginal) ``` - converts general JSON schema 
to EIO JSON metadata.

``` makeSchemaInline(json, availableSchemas) ``` - replacing _$ref_ recursively with full object description
for provided _json_ object using _availableSchemas_ schemas map.

## License

Apache-2.0 © [elastic.io GmbH](http://www.elastic.io)
