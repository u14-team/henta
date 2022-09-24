import { Attachment } from '@henta/core';
import type PlatformTg from './index.js';

export default class TgAttachment extends Attachment {
  declare platform: PlatformTg;

  async getUrl() {
    const fileInfo = await this.platform.tg.telegram.getFileLink(this.payload.at(-1).file_id);
    return fileInfo.toString();
  }
}