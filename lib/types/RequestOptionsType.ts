import { AxiosRequestConfig } from "axios";

export interface RequestOptionsType extends AxiosRequestConfig{
  rebound?: boolean; // enable rebound
  gzip?: boolean; // decompress gzip responses
  useBaseURLFromConfig?: boolean // default true;
  retry?: number;
  delay?: number;
}
