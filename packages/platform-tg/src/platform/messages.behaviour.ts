import type { ISendMessageOptions } from '@henta/core';
import { MessagesBehaviour } from '@henta/core';
import type { Telegraf, Types } from 'telegraf';
import getKeyboardButton from '../util/keyboard';

export default class TelegramMessagesBehaviour extends MessagesBehaviour {
  public constructor(private readonly tg: Telegraf) {
    super();
  }

  public async sendMessage(
    options: ISendMessageOptions,
    peerId: string,
  ): Promise<void> {
    // Called first to process "options.text".
    const params = this.prepareMessageParams(options);
    await this.tg.telegram.sendMessage(peerId, options.text, params);
  }

  public async editMessage(
    options: ISendMessageOptions,
    messageId: string,
    peerId: string,
  ): Promise<void> {
    // Called first to process "options.text".
    const params = this.prepareMessageParams(
      options,
    ) as Types.ExtraEditMessageText;

    await this.tg.telegram.editMessageText(
      peerId,
      parseInt(messageId),
      undefined,
      options.text,
      params,
    );

    await this.tg.telegram.editMessageReplyMarkup(
      peerId,
      parseInt(messageId),
      undefined,
      params.reply_markup,
    );
  }

  public async deleteMessage(messageId: string, peerId: string): Promise<void> {
    await this.tg.telegram.deleteMessage(peerId, parseInt(messageId));
  }

  private prepareMessageParams(
    options: ISendMessageOptions,
  ): Types.ExtraReplyMessage {
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
      extra.link_preview_options = {
        is_disabled: options.isParseLinks,
      };
    }

    // Escape all tag-like entities not related to https://core.telegram.org/api/entities#allowed-entities
    if (options.text?.includes('<') || options.text?.includes('>')) {
      options.text = options.text.replace(
        /<(?!\/?(?:b|strong|i|em|code|s|strike|del|u|pre|a|tg-spoiler)\b)(.*?)>/g,
        '&lt;$1&gt;',
      );
    }

    return extra;
  }
}
