"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creds = void 0;
/* eslint-disable import/first */
process.env.LOG_LEVEL = 'TRACE';
process.env.LOG_OUTPUT_MODE = 'short';
const fs_1 = require("fs");
const dotenv_1 = require("dotenv");
if ((0, fs_1.existsSync)('.env')) {
    (0, dotenv_1.config)();
    const { ELASTICIO_OBJECT_STORAGE_TOKEN, ELASTICIO_OBJECT_STORAGE_URI } = process.env;
    if (!ELASTICIO_OBJECT_STORAGE_TOKEN || !ELASTICIO_OBJECT_STORAGE_URI) {
        throw new Error('Please, provide all environment variables');
    }
}
else {
    throw new Error('Please, provide environment variables to .env');
}
const { ELASTICIO_OBJECT_STORAGE_TOKEN, ELASTICIO_OBJECT_STORAGE_URI } = process.env;
exports.creds = {
    token: ELASTICIO_OBJECT_STORAGE_TOKEN,
    uri: ELASTICIO_OBJECT_STORAGE_URI,
};
