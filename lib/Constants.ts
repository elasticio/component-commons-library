export const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT ? parseInt(process.env.REQUEST_TIMEOUT, 10) : 30000; // 30s
export const REQUEST_MAX_RETRY = process.env.REQUEST_MAX_RETRY ? parseInt(process.env.REQUEST_MAX_RETRY, 10) : 7; // 10s
export const REQUEST_RETRY_DELAY = process.env.REQUEST_RETRY_DELAY ? parseInt(process.env.REQUEST_RETRY_DELAY, 10) : 7000; // 7s
export const REQUEST_ATTACHMENT_MAX_CONTENT_LENGTH = process.env.REQUEST_MAX_CONTENT_LENGTH ? parseInt(process.env.REQUEST_MAX_CONTENT_LENGTH, 10) : 10485760; // 10MB
export const REQUEST_MAX_CONTENT_LENGTH = process.env.REQUEST_MAX_CONTENT_LENGTH ? parseInt(process.env.REQUEST_MAX_CONTENT_LENGTH, 10) : 10485760; // 10MB
export const MAX_REDIRECTS_COUNT = process.env.MAX_REDIRECTS_COUNT ? parseInt(process.env.MAX_REDIRECTS_COUNT, 10) : 10;
