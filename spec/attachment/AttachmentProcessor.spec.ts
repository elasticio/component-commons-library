/* eslint-disable no-buffer-constructor */
import chai from 'chai';
import fs from 'fs';
import { Readable } from 'stream';
import sinon from 'sinon';
import { ObjectStorage } from '@elastic.io/maester-client';
import { AttachmentProcessor, STORAGE_TYPE_PARAMETER, MAESTER_OBJECT_ID_ENDPOINT } from '../../src/attachment/AttachmentProcessor';

const { expect } = chai;
const maesterUri = 'https://ma.estr';
process.env.ELASTICIO_OBJECT_STORAGE_TOKEN = 'token';
process.env.ELASTICIO_OBJECT_STORAGE_URI = maesterUri;

const formStream = (dataString: string): Readable => {
  const stream = new Readable();
  stream.push(dataString);
  stream.push(null);
  return stream;
};

describe('AttachmentProcessor', () => {
  const attachmentProcessor = new AttachmentProcessor('userAgent');
  describe('Steward', () => {
    it('Should successfully retrieve csv', async () => {
      const attachmentOptions = {
        'content-type': 'arraybuffer',
        url: 'http://insight.dev.schoolwires.com/HelpAssets/C2Assets/C2Files/C2ImportCalEventSample.csv',
      };

      const result: any = await attachmentProcessor.getAttachment(attachmentOptions.url, attachmentOptions['content-type']);
      const encodedResult = new Buffer(result.data, 'binary').toString('base64');
      const expectedResult = fs.readFileSync('spec/attachment/resources/base64csv.txt').toString();
      expect(encodedResult).to.be.equal(expectedResult);
    });
    it('Should successfully retrieve png image', async () => {
      const attachmentOptions = {
        'content-type': 'arraybuffer',
        url: `https://httpbin.org/image/png?${STORAGE_TYPE_PARAMETER}=steward`,
      };

      const result: any = await attachmentProcessor.getAttachment(attachmentOptions.url, 'arraybuffer');
      const encodedResult = new Buffer(result.data, 'binary').toString('base64');
      const expectedResult = fs.readFileSync('spec/attachment/resources/base64Png.txt').toString();
      expect(encodedResult).to.be.equal(expectedResult);
    });
  });
  describe('maester', () => {
    let getById;
    beforeEach(() => {
      getById = sinon.stub(ObjectStorage.prototype, 'getOne').callsFake(async () => ({ data: formStream('i`m a stream') }));
    });
    afterEach(() => {
      sinon.restore();
    });
    it('Should successfully retrieve response (stream)', async () => {
      const attachmentOptions = {
        'content-type': 'stream',
        url: `${maesterUri}${MAESTER_OBJECT_ID_ENDPOINT}object_id?${STORAGE_TYPE_PARAMETER}=maester`,
      };

      const result: any = await attachmentProcessor.getAttachment(attachmentOptions.url, attachmentOptions['content-type']);
      expect(result.toString('base64')).to.be.equal({ data: formStream('i`m a stream') }.toString());
      expect(getById.getCall(0).args[0]).to.be.equal('object_id');
      expect(getById.getCall(0).args[1]).to.be.deep.equal({ responseType: 'stream' });
    });
  });
});
