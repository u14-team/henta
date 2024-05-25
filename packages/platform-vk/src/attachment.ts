import { Attachment } from '@henta/core';
import type PlatformVk from './vk.platform';

export default class VkAttachment extends Attachment {
  public declare platform: PlatformVk;

  public constructor(type: string, payload: any, platform: any) {
    let computedType = type;
    if (type === 'doc' && payload.extension === 'ogg') {
      computedType = 'audio_message';
    }

    super(computedType, payload, platform);
  }

  public getUrl() {
    switch (this.type) {
      case 'photo':
        return this.payload.largeSizeUrl;
      case 'audio_message':
      case 'document':
        return this.payload.url;
    }

    throw new Error(`Url on attachment ${this.type} is not supported`);
  }
}
