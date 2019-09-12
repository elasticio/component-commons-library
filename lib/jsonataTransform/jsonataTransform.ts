const jsonata = require('@elastic.io/jsonata-moment');

const PASSTHROUGH_BODY_PROPERTY = 'elasticio';

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
export function jsonataTransform(msg, cfg) {
  const expression = cfg.expression;
  const compiledExpression = jsonata(expression);
  handlePassthrough(msg);
  return compiledExpression.evaluate(msg.body);
}

function handlePassthrough(message) {
  if (message.passthrough && Object.keys(message.passthrough)) {
    if (PASSTHROUGH_BODY_PROPERTY in message.body) {
      throw new Error(`${PASSTHROUGH_BODY_PROPERTY} property is reserved \
            if you are using passthrough functionality`);
    }

    message.body.elasticio = {};
    Object.assign(message.body.elasticio, message.passthrough);
  }
  return message;
}
