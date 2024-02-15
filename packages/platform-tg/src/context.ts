import type Context from 'telegraf/typings/context';
import type { Update } from 'telegraf/typings/core/types/typegram';
import getKeyboardButton from './util/keyboard.js';
import TgAttachment from './attachment.js';
import type { ISendMessageOptions } from '@henta/core';
import type { Upload } from '@henta/core';
import {
  normalizeUploads,
  UploadSourceType,
  PlatformContext,
} from '@henta/core';

function collectAttachmentsFromMessage(message, platform) {
  const response = [];

  if (message.voice) {
    response.push(new TgAttachment('audio_message', message.voice, platform));
  }

  if (message.photo) {
    response.push(
      new TgAttachment(
        'photo',
        {
          file_id: message.photo.at(-1).file_id,
          sizes: message.photo,
        },
        platform,
      ),
    );
  }

  return response;
}

export default class PlatformTgContext extends PlatformContext {
  public readonly source = 'tg';
  public declare raw: Context<Update>;

  public constructor(raw: Context<Update>, platform: any) {
    super(raw, null, platform);
    this.text = this.originalText || this.raw?.message?.['caption'];
    this.payload =
      this.raw.update['callback_query']?.data &&
      JSON.parse(this.raw.update['callback_query']?.data);
  }

  public get originalText() {
    return this.raw.update['message']?.text;
  }

  public get senderId() {
    return this.raw.from.id.toString();
  }

  public get isChat() {
    return this.raw.chat.type !== 'private';
  }

  public get peerId() {
    return this.raw.chat.id.toString();
  }

  public get attachments() {
    if (!this.raw.message) {
      return [];
    }

    return collectAttachmentsFromMessage(this.raw.message, this.platform);
  }

  public get nestedAttachments() {
    if (!this.raw.message?.['reply_to_message']) {
      return [];
    }

    return collectAttachmentsFromMessage(
      this.raw.message['reply_to_message'],
      this.platform,
    );
  }

  public serialize() {
    return this.raw.update;
  }

  public async send(message: ISendMessageOptions, isAnswer = false) {
    if (this.raw.update.callback_query && message.payload?.popup) {
      await this.raw.answerCbQuery(message.text);
      return this.sendedAnswer;
    }

    let files: Upload[];
    if (message.files?.length) {
      files = await normalizeUploads(message.files, [UploadSourceType.Stream]);
    }

    const keyboard = this.normalizeKeyboard(message.keyboard)?.map((row) =>
      row.map((v) => getKeyboardButton(v)),
    );

    const body = {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: keyboard,
      },
    };

    // Escape all tag-like entities not related to https://core.telegram.org/api/entities#allowed-entities
    if (message.text?.includes('<') || message.text?.includes('>')) {
      message.text = message.text.replace(/<(?![\/]?(?:b|strong|i|em|code|s|strike|del|u|pre|tg-spoiler)\b)(.*?)>/g, '&lt;$1&gt;');
    }

    if (files) {
      const sendAttachment = (file: Upload, body = {}) => {
        const methods = {
          photo: 'sendPhoto',
          audio_message: 'sendVoice',
          document: 'sendDocument',
        };

        // this.raw.replyWithMediaGroup()
        const methodName = methods[file.type];
        return this.raw[methodName](
          {
            source: file.data,
            filename: file.name,
          },
          body,
        );
      };

      const captionBody = { ...body, caption: message.text };
      // TODO: sendMediaGroup
      const firstAttachment = files.shift();

      const [firstResponse] = await Promise.all([
        sendAttachment(firstAttachment, captionBody),
        ...files.map((file) => sendAttachment(file)),
      ]);

      return firstResponse;
    }

    if (this.sendedAnswer && isAnswer) {
      // console.log('edit', this.sendedAnswer);
      if (this.sendedAnswer.caption !== undefined) {
        return this.raw.telegram.editMessageCaption(
          this.sendedAnswer.chat.id,
          this.sendedAnswer.message_id,
          null,
          message.text,
          body,
        );
      }

      return this.raw.telegram.editMessageText(
        this.sendedAnswer.chat?.id,
        this.sendedAnswer.message_id,
        null,
        message.text,
        body,
      );
    }

    return this.raw.reply(message.text, body);
  }
}
