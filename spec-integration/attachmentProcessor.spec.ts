import fs from 'fs';
import path from 'path';
import chai, { expect } from 'chai';
import axios from 'axios';
import { ObjectStorage } from '@elastic.io/maester-client';
import { Readable } from 'stream';
import { creds } from './common';
import { AttachmentProcessor } from '../src/attachment/AttachmentProcessor';

chai.use(require('chai-as-promised'));

describe('AttachmentProcessor', () => {
  const objectStorage = new ObjectStorage({ uri: creds.uri, jwtSecret: creds.token });
  const attachmentProcessor = new AttachmentProcessor();
  describe('uploadAttachment', () => {
    it('uploadAttachment (/samples/sample.json)', async () => {
      const getFileAsStream = async () => fs.createReadStream(path.join(__dirname, './samples/sample.json'));
      const objectId = await attachmentProcessor.uploadAttachment(getFileAsStream);
      const objectHeaders = await objectStorage.getHeaders(objectId);
      expect(objectHeaders['content-type']).to.be.equal('application/json');
    });
    it('uploadAttachment (/samples/image.png)', async () => {
      const getFileAsStream = async () => fs.createReadStream(path.join(__dirname, './samples/image.png'));
      const objectId = await attachmentProcessor.uploadAttachment(getFileAsStream);
      const objectHeaders = await objectStorage.getHeaders(objectId);
      expect(objectHeaders['content-type']).to.be.equal('image/png');
    });
    it('uploadAttachment (axios, pdf)', async () => {
      const getAttachAsStream = async () => (
        await axios.get('http://environmentclearance.nic.in/writereaddata/FormB/Agenda/2201201642EWMJ8Bpdf18.pdf', { responseType: 'stream' })
      ).data;
      const objectId = await attachmentProcessor.uploadAttachment(getAttachAsStream);
      const objectHeaders = await objectStorage.getHeaders(objectId);
      expect(objectHeaders['content-type']).to.be.equal('application/pdf');
    });
    it('uploadAttachment buffer to stream', async () => {
      const getFileAsStream = async () => Readable.from(fs.readFileSync(path.join(__dirname, './samples/sample.json').toString()));
      const objectId = await attachmentProcessor.uploadAttachment(getFileAsStream);
      const objectHeaders = await objectStorage.getHeaders(objectId);
      expect(objectHeaders['content-type']).to.be.equal('application/json');
    });
    it('should throw error (requestTimeout: 1ms)', async () => {
      const getFileAsStream = async () => fs.createReadStream(path.join(__dirname, './samples/image.png'));
      await expect(
        attachmentProcessor.uploadAttachment(getFileAsStream, { requestTimeout: 1, retriesCount: 1, retryDelay: 1 })
      ).to.be.rejectedWith('Server error during request');
    });
  });
});
