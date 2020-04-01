import { AxiosRequestConfig } from "axios";

export interface RequestOptionsType extends AxiosRequestConfig{
  rebound?: boolean; // enable rebound
  useBaseURLFromConfig?: boolean // default true;
  retry?: number;
  delay?: number;
}
