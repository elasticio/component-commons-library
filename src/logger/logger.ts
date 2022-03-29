import bunyan from 'bunyan';
import bunyanFormat from 'bunyan-format';

const outputMode = process.env['LOG_OUTPUT_MODE'] || 'bunyan';

const formatOut = bunyanFormat({
  outputMode,
  levelInString: true,
  colorFromLevel: {
    10: 'white',   // TRACE
    20: 'yellow',  // DEBUG
    30: 'green',   // INFO
    40: 'magenta', // WARN
    50: 'red',     // ERROR
    60: 'inverse', // FATAL
  },
});

const lvlMap = {
  FATAL: bunyan.FATAL,
  ERROR: bunyan.ERROR,
  WARN: bunyan.WARN,
  INFO: bunyan.INFO,
  DEBUG: bunyan.DEBUG,
  TRACE: bunyan.TRACE,
};

const appName = process.env['APP_NAME'] || 'app';

const defaultLevel = 'INFO';
const level = process.env['LOG_LEVEL'] || defaultLevel;

function errSerializerWithErrors(err) {
  const output = bunyan.stdSerializers.err(err);
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

const serializers = Object.create(bunyan.stdSerializers);
serializers.err = errSerializerWithErrors;
serializers.req = requestSerializer;

const loggers = {};

export function getLogger(loggerName = 'defaultLogger') {
  if (!loggers[loggerName]) {
    loggers[loggerName] = bunyan.createLogger({
      serializers,
      level: lvlMap[level.toUpperCase()],
      name: appName,
      src: true,
      stream: formatOut,
    });
  }
  return loggers[loggerName];
}
