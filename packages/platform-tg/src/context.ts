
import type HentaBot from '@henta/core';
import PlatformContext from '@henta/core/context';
import Context from 'telegraf/typings/context';
import { Update } from 'telegraf/typings/core/types/typegram';
import getKeyboardButton from './util/keyboard.js';

export default class PlatformTgContext extends PlatformContext {
  source = 'tg';
  declare raw: Context<Update>;

  constructor(raw: Context<Update>, bot: HentaBot) {
    super(raw, bot);
    this.text = this.raw.update.message?.text;
  }

  get originalText() {
    return this.raw.update.message?.text;
  }

  get senderId() {
    return this.raw.from.id.toString();
  }

  async send(message) {
    let attachments: any[];
    if (message.attachments?.length) {
      attachments = await this.loadAttachments(message.attachments);
    }

    const keyboard = this.normalizeKeyboard(message.keyboard)
      ?.map(row => row.map(v => getKeyboardButton(v)));

    if (attachments) {
      const firstAttachment = attachments.shift();
      await this.raw.sendPhoto(typeof firstAttachment.data === 'string' ? firstAttachment.data : { source: firstAttachment.data }, {
        caption: message.text,
        reply_markup: {
          inline_keyboard: keyboard
        }
      });

      return;
    }

    await this.raw.reply(message.text, {
      reply_markup: JSON.stringify({
        inline_keyboard: keyboard
      })
    });
  }

  get payload() {
    return this.raw.update.callback_query?.data && JSON.parse(this.raw.update.callback_query?.data);
  }
}
