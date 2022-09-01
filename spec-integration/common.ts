/* eslint-disable import/first */
process.env.LOG_LEVEL = 'TRACE';
process.env.LOG_OUTPUT_MODE = 'short';
import { existsSync } from 'fs';
import { config } from 'dotenv';

if (existsSync('.env')) {
  config();
  const {
    ELASTICIO_OBJECT_STORAGE_TOKEN, ELASTICIO_OBJECT_STORAGE_URI, ELASTICIO_WORKSPACE_ID, SECRET_ID
  } = process.env;
  if (!ELASTICIO_OBJECT_STORAGE_TOKEN || !ELASTICIO_OBJECT_STORAGE_URI || !ELASTICIO_WORKSPACE_ID || !SECRET_ID) {
    throw new Error('Please, provide all environment variables');
  }
} else {
  throw new Error('Please, provide environment variables to .env');
}
const { ELASTICIO_OBJECT_STORAGE_TOKEN, ELASTICIO_OBJECT_STORAGE_URI, ELASTICIO_WORKSPACE_ID, SECRET_ID, BASE_URL } = process.env;

export const creds = {
  token: ELASTICIO_OBJECT_STORAGE_TOKEN,
  uri: ELASTICIO_OBJECT_STORAGE_URI,
  workspaceId: ELASTICIO_WORKSPACE_ID,
  secretId: SECRET_ID,
  resourceServerUrl: BASE_URL
};
