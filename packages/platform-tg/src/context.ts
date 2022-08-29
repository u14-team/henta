
import type HentaBot from '@henta/core';
import PlatformContext from '@henta/core/context';
import Context from 'telegraf/typings/context';
import { Update } from 'telegraf/typings/core/types/typegram';

export default class PlatformTgContext extends PlatformContext {
  source = 'tg';
  declare raw: Context<Update>;

  constructor(raw: Context<Update>, bot: HentaBot) {
    super(raw, bot);
    this.text = this.raw.update.message.text;
  }

  get originalText() {
    return this.raw.update.message.text;
  }

  get senderId() {
    return this.raw.from.id.toString();
  }

  async send(message) {
    await this.raw.reply(message.text);
  }
}