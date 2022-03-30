"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonataTransform = void 0;
const jsonata = require('@elastic.io/jsonata-moment');
const PASSTHROUGH_BODY_PROPERTY = 'elasticio';
/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 * @param context this of action or trigger, optional

 */
function jsonataTransform(msg, cfg, context) {
    const expression = cfg.expression;
    const compiledExpression = jsonata(expression);
    if (context && context.getFlowVariables) {
        compiledExpression.assign('getFlowVariables', () => context.getFlowVariables());
    }
    const handledMessage = handlePassthrough(msg);
    const passthrough = handledMessage.body[PASSTHROUGH_BODY_PROPERTY];
    compiledExpression.assign('getPassthrough', () => passthrough);
    return compiledExpression.evaluate(handledMessage.body);
}
exports.jsonataTransform = jsonataTransform;
function handlePassthrough(message) {
    if (message.passthrough && Object.keys(message.passthrough)) {
        if (PASSTHROUGH_BODY_PROPERTY in message.body) {
            throw new Error(`${PASSTHROUGH_BODY_PROPERTY} property is reserved \
            if you are using passthrough functionality`);
        }
        const result = JSON.parse(JSON.stringify(message)); // Otherwise subsequent calls to Jsonata transform with same message would fail
        result.body.elasticio = {};
        Object.assign(result.body.elasticio, result.passthrough);
        return result;
    }
    return message;
}
