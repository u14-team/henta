import type { MessageContext } from 'vk-io';
import PlatformContext from '@henta/core/context';
import type HentaBot from '@henta/core';
import getKeyboardButton from './util/keyboard.js';

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
    await this.raw.send({
      message: message.text,
      keyboard: message.keyboard && JSON.stringify({
        inline: true,
        buttons: message.keyboard.map(row => row.map(v => getKeyboardButton(v)))
      })
    });
  }
}