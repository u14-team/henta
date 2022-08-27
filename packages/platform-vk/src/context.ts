import type { MessageContext } from 'vk-io';
import PlatformContext from '@henta/core/context';

export default class PlatformVkContext extends PlatformContext {
  source = 'vk';
  raw: MessageContext;

  constructor(raw: MessageContext) {
    super();

    this.raw = raw;
    this.text = this.raw.text;
  }

  get originalText() {
    return this.raw.text;
  }

  send(message) {
    return this.raw.send(message.text);
  }
}