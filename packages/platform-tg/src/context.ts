
import PlatformContext from '@henta/core/context';
import Context from 'telegraf/typings/context';
import { Update } from 'telegraf/typings/core/types/typegram';

export default class PlatformTgContext extends PlatformContext {
  source = 'tg';
  raw: Context<Update>;

  constructor(raw: Context<Update>) {
    super();

    this.raw = raw;
    this.text = this.raw.update.message.text;
  }

  get originalText() {
    return this.raw.update.message.text;
  }

  send(message) {
    return this.raw.reply(message.text);
  }
}