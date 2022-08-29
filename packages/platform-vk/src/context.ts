import type { MessageContext } from 'vk-io';
import PlatformContext from '@henta/core/context';
import type HentaBot from '@henta/core';

export default class PlatformVkContext extends PlatformContext {
  source = 'vk';
  declare raw: MessageContext;

  constructor(raw: MessageContext, bot: HentaBot) {
    super(raw, bot);
    this.text = this.raw.text;
  }

  get originalText() {
    return this.raw.text;
  }

  get senderId() {
    return this.raw.senderId.toString();
  }

  async send(message) {
    await this.raw.send(message.text);
  }
}