"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setEnvs = void 0;
const fs_1 = require("fs");
const dotenv_1 = require("dotenv");
const setEnvs = () => {
    if ((0, fs_1.existsSync)('.env')) {
        (0, dotenv_1.config)();
    }
};
exports.setEnvs = setEnvs;
