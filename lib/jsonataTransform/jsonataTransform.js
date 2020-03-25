"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    handlePassthrough(msg);
    const passthrough = msg.body[PASSTHROUGH_BODY_PROPERTY];
    compiledExpression.assign('getPassthrough', () => passthrough);
    return compiledExpression.evaluate(msg.body);
}
exports.jsonataTransform = jsonataTransform;
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
//# sourceMappingURL=jsonataTransform.js.map