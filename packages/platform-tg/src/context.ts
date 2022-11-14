
import type HentaBot from '@henta/core';
import PlatformContext from '@henta/core/context';
import type Context from 'telegraf/typings/context';
import type { Update } from 'telegraf/typings/core/types/typegram';
import getKeyboardButton from './util/keyboard.js';
import TgAttachment from './attachment.js';
import { ISendMessageOptions } from '@henta/core';
import { normalizeUploads, Upload, UploadSourceType, UploadStream } from '@henta/core/files';

function collectAttachmentsFromMessage(message, platform) {
  const response = [];

  if (message.voice) {
    response.push(new TgAttachment(
      'audio_message',
      message.voice,
      platform
    ));
  }

  if (message.photo) {
    response.push(new TgAttachment(
      'photo',
      {
        file_id: message.photo.at(-1).file_id,
        sizes: message.photo
      },
      platform
    ));
  }

  return response;
}

export default class PlatformTgContext extends PlatformContext {
  source = 'tg';
  declare raw: Context<Update>;

  constructor(raw: Context<Update>, bot: HentaBot, platform: any) {
    super(raw, bot, platform);
    this.text = this.originalText || this.raw?.message?.['caption'];
  }

  get originalText() {
    return this.raw.update['message']?.text;
  }

  get senderId() {
    return this.raw.from.id.toString();
  }

  get isChat() {
    return this.raw.chat.type !== 'private';
  }

  get peerId() {
    return this.raw.chat.id.toString();
  }

  get attachments() {
    if (!this.raw.message) {
      return [];
    }

    return collectAttachmentsFromMessage(this.raw.message, this.platform);
  }

  get nestedAttachments() {
    if (!this.raw.message?.['reply_to_message']) {
      return [];
    }

    return collectAttachmentsFromMessage(this.raw.message['reply_to_message'], this.platform);
  }

  async send(message: ISendMessageOptions) {
    let files: Upload[];
    if (message.files?.length) {
      files = await normalizeUploads(message.files);
    }

    const keyboard = this.normalizeKeyboard(message.keyboard)
      ?.map(row => row.map(v => getKeyboardButton(v)));

    const body = {
      reply_markup: {
        inline_keyboard: keyboard
      }
    };

    if (files) {
      const sendAttachment = (attachment: Upload, body = {}) => {
        const methods = {
          photo: 'sendPhoto',
          audio_message: 'sendVoice'
        };

        const methodName = methods[attachment.type];
        return this.raw[methodName]({ source: attachment.data }, body);
      };

      const captionBody = { ...body, caption: message.text };
      const firstAttachment = files.shift();

      const [firstResponse] = await Promise.all([
        sendAttachment(firstAttachment, captionBody),
        ...files.map(file => sendAttachment(file))
      ]);

      return firstResponse;
    }

    return this.raw.reply(message.text, {
      reply_markup: JSON.stringify({
        inline_keyboard: keyboard
      }) as any
    });
  }

  get payload() {
    return this.raw.update['callback_query']?.data && JSON.parse(this.raw.update['callback_query']?.data);
  }
}
