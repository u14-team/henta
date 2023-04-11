import { Attachment } from '@henta/core';
import type PlatformTg from './index.js';

export default class TgAttachment extends Attachment {
  public declare platform: PlatformTg;

  public async getUrl() {
    const fileInfo = await this.platform.tg.telegram.getFileLink(
      this.payload.file_id,
    );

    return fileInfo.toString();
  }
}
