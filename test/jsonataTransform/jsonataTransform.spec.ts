import chai from 'chai';

const { expect } = chai;
import { JsonataTransform } from '../../lib';

const eioUtils = require('elasticio-node').messages;

describe('Transformation test', () => {
  it('should handle simple transforms', () => {
    const result = JsonataTransform.jsonataTransform(eioUtils.newMessageWithBody({
      first: 'Renat',
      last: 'Zubairov',
    }),                                              {
      expression: '{ "fullName": first & " " & last }',
    },                                               null);
    expect(result).to.deep.equal({
      fullName: 'Renat Zubairov',
    });
  });

  it('should not produce an empty message if transformation returns undefined', () => {
    const result = JsonataTransform.jsonataTransform(eioUtils.newMessageWithBody({
      first: 'Renat',
      last: 'Zubairov',
    }),                                              {
      expression: '$[foo=2].({ "foo": boom })',
    },                                               null);
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
    const result = JsonataTransform.jsonataTransform(msg, {
      expression: '{ "fullName": first & " " & elasticio.ps}',
    },                                               null);
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
    const result = JsonataTransform.jsonataTransform(msg, {
      expression: '$getPassthrough()',
    },                                               null);
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
    const result = JsonataTransform.jsonataTransform(msg, {
      expression: '$getFlowVariables()',
    },                                               { getFlowVariables: () => flowVariables});
    expect(result).to.deep.equal(flowVariables);
  });
});
