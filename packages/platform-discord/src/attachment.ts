import { Attachment } from '@henta/core';
import type DiscordPlatform from './index.js';

export default class DiscordAttachment extends Attachment {
  declare platform: DiscordPlatform;

  getUrl() {
    return this.payload.url;
  }
}
