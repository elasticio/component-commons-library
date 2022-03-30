"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = void 0;
const bunyan_1 = __importDefault(require("bunyan"));
const bunyan_format_1 = __importDefault(require("bunyan-format"));
const outputMode = process.env['LOG_OUTPUT_MODE'] || 'bunyan';
const formatOut = (0, bunyan_format_1.default)({
    outputMode,
    levelInString: true,
    colorFromLevel: {
        10: 'white',
        20: 'yellow',
        30: 'green',
        40: 'magenta',
        50: 'red',
        60: 'inverse', // FATAL
    },
});
const lvlMap = {
    FATAL: bunyan_1.default.FATAL,
    ERROR: bunyan_1.default.ERROR,
    WARN: bunyan_1.default.WARN,
    INFO: bunyan_1.default.INFO,
    DEBUG: bunyan_1.default.DEBUG,
    TRACE: bunyan_1.default.TRACE,
};
const appName = process.env['APP_NAME'] || 'app';
const defaultLevel = 'INFO';
const level = process.env['LOG_LEVEL'] || defaultLevel;
function errSerializerWithErrors(err) {
    const output = bunyan_1.default.stdSerializers.err(err);
    if (err.errors) {
        output.errors = err.errors;
    }
    return output;
}
function requestSerializer(req) {
    if (!req || !req.connection) {
        return req;
    }
    return {
        method: req.method,
        url: req.url,
        headers: req.headers,
        remoteAddress: req.connection.remoteAddress,
        remotePort: req.connection.remotePort,
        body: req.body,
    };
}
const serializers = Object.create(bunyan_1.default.stdSerializers);
serializers.err = errSerializerWithErrors;
serializers.req = requestSerializer;
const loggers = {};
function getLogger(loggerName = 'defaultLogger') {
    if (!loggers[loggerName]) {
        loggers[loggerName] = bunyan_1.default.createLogger({
            serializers,
            level: lvlMap[level.toUpperCase()],
            name: appName,
            src: true,
            stream: formatOut,
        });
    }
    return loggers[loggerName];
}
exports.getLogger = getLogger;
