import chai from 'chai';
import fs from 'fs';
import { AttachmentProcessor } from '../../lib';

const { expect } = chai;

describe('AttachmentProcessor', () => {
  it('Should successfully retrieve csv', async () => {
    const attachmentOptions = {
      'content-type': 'arraybuffer',
      url: 'http://insight.dev.schoolwires.com/HelpAssets/C2Assets/C2Files/C2ImportCalEventSample.csv',
    };

    const attachmentProcessor = new AttachmentProcessor();
    const result = await attachmentProcessor.getAttachment(attachmentOptions.url, attachmentOptions['content-type']);
    const encodedResult = Buffer.from(result.data, 'binary').toString('base64');
    const expectedResult = fs.readFileSync('test/attachment/resources/base64csv.txt').toString();
    expect(encodedResult).to.be.equal(expectedResult);
  });

  it('Should successfully retrieve png image', async () => {
    const attachmentOptions = {
      'content-type': 'arraybuffer',
      url: 'https://httpbin.org/image/png',
    };

    const attachmentProcessor = new AttachmentProcessor();
    const result = await attachmentProcessor.getAttachment(attachmentOptions.url, 'arraybuffer');
    const encodedResult = Buffer.from(result.data, 'binary').toString('base64');
    const expectedResult = fs.readFileSync('test/attachment/resources/base64Png.txt').toString();
    expect(encodedResult).to.be.equal(expectedResult);
  });
});
