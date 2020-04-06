import { AxiosResponse } from 'axios';
import { RestResponseType } from '../types/RestResponseType';


export function prepareResponseStructure(response: AxiosResponse): RestResponseType {
  const result: RestResponseType = {
    headers: response.headers || undefined,
    body: response.data || {},
    statusCode: response.status,
    statusText: response.statusText || undefined,
  };
  return result;
}
