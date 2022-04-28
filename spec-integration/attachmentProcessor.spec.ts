import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import { setEnvs } from './common';

setEnvs();

// eslint-disable-next-line import/first
import { AttachmentProcessor } from '../src/attachment/AttachmentProcessor';

describe('AttachmentProcessor', () => {
  describe('uploadAttachment', () => {
    it('uploadAttachment (/samples/sample.json)', async () => {
      const file = fs.createReadStream(path.join(__dirname, './samples/sample.json'));
      const { data } = await new AttachmentProcessor().uploadAttachment(file);
      expect(data.contentType).to.be.equal('application/json');
    });
    it('uploadAttachment (/samples/image.png)', async () => {
      const file = fs.createReadStream(path.join(__dirname, './samples/image.png'));
      const { data } = await new AttachmentProcessor().uploadAttachment(file);
      expect(data.contentType).to.be.equal('image/png');
    });
  });
});
