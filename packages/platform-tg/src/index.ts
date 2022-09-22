import Platform from '@henta/core/platform';
import PlatformTgContext from './context.js';
import { Telegraf } from 'telegraf';
import type HentaBot from '@henta/core';
import TgAttachmentSender from './attachment.sender.js';

export interface PlatformTgOptions {
  token: string;
}

export default class PlatformTg extends Platform {
  tg: Telegraf;
  attachmentSender = new TgAttachmentSender(this);

  constructor(options: PlatformTgOptions) {
    super();

    this.tg = new Telegraf(options.token);
  }

  setCallback(callback: (PlatformVkContext) => void, bot: HentaBot) {
    this.tg.on('message', (rawContext) => callback(new PlatformTgContext(rawContext, bot)));
    this.tg.on('callback_query', (rawContext) => callback(new PlatformTgContext(rawContext, bot)));
  }

  async startPooling() {
    await this.tg.launch();
    process.once('SIGINT', () => this.tg.stop('SIGINT'));
    process.once('SIGTERM', () => this.tg.stop('SIGTERM'));
  }
}