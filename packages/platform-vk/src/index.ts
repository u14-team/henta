import type HentaBot from '@henta/core';
import Platform from '@henta/core/platform';
import { VK } from 'vk-io';
import PlatformVkContext from './context.js';

export interface PlatformVkOptions {
  token: string;
}

export default class PlatformVk extends Platform {
  vk: VK;

  constructor(options: PlatformVkOptions) {
    super();

    this.vk = new VK({
      token: options.token
    });
  }

  setCallback(callback: (PlatformVkContext) => void, bot: HentaBot) {
    this.vk.updates.on('message_new', rawContext => callback(new PlatformVkContext(rawContext, bot, this)));
  }

  async startPooling() {
    await this.vk.updates.start();
  }
}