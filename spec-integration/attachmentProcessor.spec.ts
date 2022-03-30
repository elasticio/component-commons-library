import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import { setEnvs } from './common';
import { AttachmentProcessor } from '../src/attachment/AttachmentProcessor';

setEnvs();

describe('AttachmentProcessor', () => {
  describe('uploadAttachment', () => {
    it('uploadAttachment (/samples/sample.json)', async () => {
      const file = fs.createReadStream(path.join(__dirname, './samples/sample.json'));
      const res = await new AttachmentProcessor().uploadAttachment(file, 'application/octet-stream');
      expect(res.data.contentType).to.be.equal('application/octet-stream');
    });
    it('uploadAttachment (/samples/image.png)', async () => {
      const file = fs.createReadStream(path.join(__dirname, './samples/image.png'));
      const res = await new AttachmentProcessor().uploadAttachment(file, 'image/png');
      expect(res.data.contentType).to.be.equal('image/png');
    });
  });
});
