import { Attachment } from '@henta/core';
import type PlatformVk from './index.js';

export default class VkAttachment extends Attachment {
  declare platform: PlatformVk;

  getUrl() {
    return this.payload.largeSizeUrl;
  }
}