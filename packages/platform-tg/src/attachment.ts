import { Attachment } from '@henta/core';
import type PlatformTg from './index.js';

export default class TgAttachment extends Attachment {
  declare platform: PlatformTg;

  async getUrl() {
    const payload = Array.isArray(this.payload) ? this.payload.at(-1) : this.payload;
    const fileInfo = await this.platform.tg.telegram.getFileLink(payload.file_id);
    return fileInfo.toString();
  }
}