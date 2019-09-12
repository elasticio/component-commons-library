import chai from 'chai';

const { expect } = chai;
import { JsonataTransform } from '../../lib';
const eioUtils = require('elasticio-node').messages;

describe('Transformation test', () => {
  it('should handle simple transforms', () => {
    const result = JsonataTransform.jsonataTransform(eioUtils.newMessageWithBody({
      first: 'Renat',
      last: 'Zubairov'
    }), {
      expression: `{ "fullName": first & " " & last }`
    });
    expect(result).to.deep.equal({
      fullName: 'Renat Zubairov'
    });
  });

  it('should not produce an empty message if transformation returns undefined', () => {
    const result = JsonataTransform.jsonataTransform(eioUtils.newMessageWithBody({
      first: 'Renat',
      last: 'Zubairov'
    }), {
      expression: `$[foo=2].({ "foo": boom })`
    });
    expect(result).to.be.an('undefined');
  });

  it('should handle passthough properly', () => {
    const msg = eioUtils.newMessageWithBody({
      first: 'Renat',
      last: 'Zubairov'
    });
    msg.passthrough = {
      ps: 'psworks'
    };
    const result = JsonataTransform.jsonataTransform(msg, {
      expression: `{ "fullName": first & " " & elasticio.ps}`
    });
    expect(result).to.deep.equal({
      fullName: 'Renat psworks'
    });
  });
});
