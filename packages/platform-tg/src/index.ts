import Platform from '@henta/core/src/platform/platform.js';
import PlatformTgContext from './context.js';
import { Context, Telegraf } from 'telegraf';
import type HentaBot from '@henta/core';
import TgAttachmentSender from './attachment.sender.js';
import TgAttachment from './attachment.js';
import { ISendMessageOptions } from '@henta/core';
import { Upload, normalizeUploads, UploadSourceType } from '@henta/core/files';
import getKeyboardButton from './util/keyboard.js';

export interface PlatformTgOptions {
  token: string;
}

export default class PlatformTg extends Platform {
  slug = 'tg';

  tg: Telegraf;
  attachmentSender = new TgAttachmentSender(this);

  constructor(options: PlatformTgOptions) {
    super();

    this.tg = new Telegraf(options.token);
  }

  setCallback(callback: (PlatformVkContext) => void, bot: HentaBot) {
    this.tg.on('message', (rawContext) => callback(new PlatformTgContext(rawContext, bot, this)));
    this.tg.on('callback_query', (rawContext) => callback(new PlatformTgContext(rawContext, bot, this)));
  }

  async startPooling() {
    await this.tg.launch();
    process.once('SIGINT', () => this.tg.stop('SIGINT'));
    process.once('SIGTERM', () => this.tg.stop('SIGTERM'));
  }

  getContextFromData(rawData: any, bot: HentaBot) {
    return new PlatformTgContext(
      new Context(rawData, this.tg.telegram, this.tg.botInfo),
      bot,
      this
    );
  }

  public async send(message: ISendMessageOptions, peer: number, messageToEdit?) {
    let files: Upload[];
    if (message.files?.length) {
      files = await normalizeUploads(message.files, [UploadSourceType.Stream]);
    }

    const keyboard = message.keyboard
      ?.map(row => row.map(v => getKeyboardButton(v)));

    const body = {
      reply_markup: {
        inline_keyboard: keyboard
      }
    };

    if (files) {
      const sendAttachment = (file: Upload, body = {}) => {
        const methods = {
          photo: 'sendPhoto',
          audio_message: 'sendVoice',
          document: 'sendDocument'
        };

        const methodName = methods[file.type];
        return this.tg[methodName](peer, {
          source: file.data,
          filename: file.name
        }, body);
      };

      const captionBody = { ...body, caption: message.text };
      // TODO: sendMediaGroup
      const firstAttachment = files.shift();

      const [firstResponse] = await Promise.all([
        sendAttachment(firstAttachment, captionBody),
        ...files.map(file => sendAttachment(file))
      ]);

      return firstResponse;
    }

    if (messageToEdit) {
      // console.log('edit', this.sendedAnswer);
      if (messageToEdit.caption !== undefined) {
        return this.tg.telegram.editMessageCaption(
          messageToEdit.chat.id,
          messageToEdit.message_id,
          null,
          message.text,
          body
        );
      }

      return this.tg.telegram.editMessageText(
        messageToEdit.chat.id,
        messageToEdit.message_id,
        null,
        message.text,
        body
      );
    }

    return this.tg.telegram.sendMessage(peer, message.text, body);
  }
}

export { TgAttachment };