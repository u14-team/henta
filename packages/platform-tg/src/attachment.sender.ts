import type PlatformTg from './index.js';

export default class TgAttachmentSender {
  platform: PlatformTg;
  types: { photo: any };

  constructor(platform: PlatformTg) {
    this.platform = platform;
    this.types = {
      photo: this.photoLoader.bind(this),
    };
  }

  photoLoader(source: any, sourceType: string) {
    return source;
  }
}
