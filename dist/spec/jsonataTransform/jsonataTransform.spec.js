"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const { expect } = chai_1.default;
const src_1 = require("../../src");
const eioUtils = require('elasticio-node').messages;
describe('Transformation test', () => {
    it('should handle simple transforms', () => {
        const result = src_1.JsonataTransform.jsonataTransform(eioUtils.newMessageWithBody({
            first: 'Renat',
            last: 'Zubairov',
        }), {
            expression: '{ "fullName": first & " " & last }',
        }, null);
        expect(result).to.deep.equal({
            fullName: 'Renat Zubairov',
        });
    });
    it('should not produce an empty message if transformation returns undefined', () => {
        const result = src_1.JsonataTransform.jsonataTransform(eioUtils.newMessageWithBody({
            first: 'Renat',
            last: 'Zubairov',
        }), {
            expression: '$[foo=2].({ "foo": boom })',
        }, null);
        expect(result).to.be.an('undefined');
    });
    it('should handle passthrough properly', () => {
        const msg = eioUtils.newMessageWithBody({
            first: 'Renat',
            last: 'Zubairov',
        });
        msg.passthrough = {
            ps: 'psworks',
        };
        const result = src_1.JsonataTransform.jsonataTransform(msg, {
            expression: '{ "fullName": first & " " & elasticio.ps}',
        }, null);
        expect(result).to.deep.equal({
            fullName: 'Renat psworks',
        });
    });
    it('should return  passthrough variables for getPassthrough expression', () => {
        const msg = eioUtils.newMessageWithBody({
            first: 'Renat',
            last: 'Zubairov',
        });
        msg.passthrough = {
            ps: 'psworks',
        };
        const result = src_1.JsonataTransform.jsonataTransform(msg, {
            expression: '$getPassthrough()',
        }, null);
        expect(result).to.deep.equal({
            ps: 'psworks',
        });
    });
    it('should return  flow variables variables for getFlowVariables expression', () => {
        const msg = eioUtils.newMessageWithBody({
            first: 'Renat',
            last: 'Zubairov',
        });
        const flowVariables = {
            var1: 'value1',
            var2: 'value2',
        };
        const result = src_1.JsonataTransform.jsonataTransform(msg, {
            expression: '$getFlowVariables()',
        }, { getFlowVariables: () => flowVariables });
        expect(result).to.deep.equal(flowVariables);
    });
    it('should handle 2 expressions on same message if dontThrowError=true', () => {
        const msg = eioUtils.newMessageWithBody({
            first: 'Renat',
            last: 'Zubairov',
        });
        msg.passthrough = {
            ps: 'psworks',
        };
        const first = src_1.JsonataTransform.jsonataTransform(msg, {
            expression: '$getPassthrough()',
        }, null);
        msg.passthrough = { test: 'test' };
        const second = src_1.JsonataTransform.jsonataTransform(msg, {
            expression: '$getPassthrough()',
        }, null);
        expect(first).to.deep.equal({
            ps: 'psworks',
        });
        expect(second).to.deep.equal({
            test: 'test',
        });
        expect(msg.body.elasticio).to.be.undefined;
    });
});
