import chai from 'chai';
import fs from 'fs';
import nock from 'nock';

const { expect } = chai;
const maesterUri = 'https://ma.estr';
process.env.ELASTICIO_OBJECT_STORAGE_TOKEN = 'token';
process.env.ELASTICIO_OBJECT_STORAGE_URI = maesterUri;
import { AttachmentProcessor, STORAGE_TYPE_PARAMETER, MAESTER_OBJECT_ID_ENDPOINT } from '../../lib/attachment/AttachmentProcessor';

describe('AttachmentProcessor', () => {
  const attachmentProcessor = new AttachmentProcessor();

  describe('Steward', () => {
    it('Should successfully retrieve csv', async () => {
      const attachmentOptions = {
        'content-type': 'arraybuffer',
        url: 'http://insight.dev.schoolwires.com/HelpAssets/C2Assets/C2Files/C2ImportCalEventSample.csv',
      };

      const result: any = await attachmentProcessor.getAttachment(attachmentOptions.url, attachmentOptions['content-type']);
      const encodedResult = new Buffer(result.data, 'binary').toString('base64');
      const expectedResult = fs.readFileSync('test/attachment/resources/base64csv.txt').toString();
      expect(encodedResult).to.be.equal(expectedResult);
    });

    it('Should successfully retrieve png image', async () => {
      const attachmentOptions = {
        'content-type': 'arraybuffer',
        url: `https://httpbin.org/image/png?${STORAGE_TYPE_PARAMETER}=steward`,
      };

      const result: any = await attachmentProcessor.getAttachment(attachmentOptions.url, 'arraybuffer');
      const encodedResult = new Buffer(result.data, 'binary').toString('base64');
      const expectedResult = fs.readFileSync('test/attachment/resources/base64Png.txt').toString();
      expect(encodedResult).to.be.equal(expectedResult);
    });
  })
  xdescribe('maester', () => {
    it('Should successfully retrieve response', async () => {
      const attachmentOptions = {
        'content-type': 'arraybuffer',
        url: `${maesterUri}${MAESTER_OBJECT_ID_ENDPOINT}object_id?${STORAGE_TYPE_PARAMETER}=maester`,
      };

      const getById = nock(maesterUri)
        .get('/objects/object_id')
        .reply(200, 'response');

      const result: any = await attachmentProcessor.getAttachment(attachmentOptions.url, attachmentOptions['content-type']);
      expect(result).to.be.equal('response');
      expect(getById.isDone()).to.be.equal(true);
    });
  })
});
