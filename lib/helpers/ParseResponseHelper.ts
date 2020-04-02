import { RestResponseType } from '../types/RestResponseType';

function prepareResponseStructure(response): RestResponseType {
  const result: RestResponseType = {
    headers: response.headers,
    body: response.data,
    statusCode: response.status,
    statusText: response.statusText,
  };
  if (typeof response.data !== 'object' || Array.isArray(response.data)) {
    result.body = { result: response.data };
  }
  return result;
}

export function parseResponse(response) {
  return prepareResponseStructure(response);
}
