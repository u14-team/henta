import { ActionsBehaviour } from '@henta/core';
import type ISendMessageOptions from '@henta/core/src/sendMessageOptions';
import type { Telegraf, Types } from 'telegraf';
import getKeyboardButton from '../util/keyboard';

export default class TelegramActionsBehaviour extends ActionsBehaviour {
  public constructor(private readonly tg: Telegraf) {
    super();
  }

  public async sendMessage(options: ISendMessageOptions, peerId: string) {
    const extra: Types.ExtraReplyMessage = {
      parse_mode: 'HTML',
    };

    if (options.keyboard) {
      const keyboard = options.keyboard.map((row) =>
        row.map((v) => getKeyboardButton(v)),
      );

      extra.reply_markup = {
        inline_keyboard: keyboard,
      };
    }

    if (options.isParseLinks !== undefined) {
      extra.disable_web_page_preview = options.isParseLinks;
    }

    // Escape all tag-like entities not related to https://core.telegram.org/api/entities#allowed-entities
    if (options.text?.includes('<') || options.text?.includes('>')) {
      options.text = options.text.replace(
        /<(?!\/?(?:b|strong|i|em|code|s|strike|del|u|pre|a|tg-spoiler)\b)(.*?)>/g,
        '&lt;$1&gt;',
      );
    }

    return void this.tg.telegram.sendMessage(peerId, options.text, extra);
  }

  public async deleteMessage(messageId: string, peerId: string) {
    return void this.tg.telegram.deleteMessage(peerId, +messageId);
  }
}
