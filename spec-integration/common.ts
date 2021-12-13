import { existsSync } from 'fs'
import { config } from 'dotenv';

export const setEnvs = () => {
  if (existsSync('.env')) {
    config();
  }
}
