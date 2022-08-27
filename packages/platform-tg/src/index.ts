import Platform from '@henta/core/platform';
import PlatformTgContext from './context.js';
import { Telegraf } from 'telegraf';

export interface PlatformTgOptions {
  token: string;
}

export default class PlatformTg extends Platform {
  tg: Telegraf;

  constructor(options: PlatformTgOptions) {
    super();

    this.tg = new Telegraf(options.token);
  }

  setCallback(callback: (PlatformVkContext) => void) {
    this.tg.on('message', rawContext => callback(new PlatformTgContext(rawContext)));
  }

  async startPooling() {
    await this.tg.launch();
    process.once('SIGINT', () => this.tg.stop('SIGINT'));
    process.once('SIGTERM', () => this.tg.stop('SIGTERM'));
  }
}