import type HentaBot from '@henta/core';
import Platform from '@henta/core/platform';
import { MessageContext, VK } from 'vk-io';
import VkAttachment from './attachment.js';
import PlatformVkContext from './context.js';

export interface PlatformVkOptions {
  token: string;
  webhookConfirmation: string;
  webhookSecret: string;
}

export default class PlatformVk extends Platform {
  slug = 'vk';
  vk: VK;

  constructor(readonly options: PlatformVkOptions) {
    super();

    this.vk = new VK({
      token: options.token,
      webhookConfirmation: options.webhookConfirmation,
      webhookSecret: options.webhookSecret
    });
  }

  setCallback(callback: (PlatformVkContext) => void, bot: HentaBot) {
    this.vk.updates.on('message_new', rawContext => callback(new PlatformVkContext(rawContext, bot, this)));
  }

  getContextFromData(rawData: any, bot: HentaBot) {
    return new PlatformVkContext(
      new MessageContext({
        payload: rawData,
        api: this.vk.api,
        upload: this.vk.upload,
        // type: 'message',
        //subTypes: SubType[];
        // state?: S;
        source: 'WEBSOCKET' as any,
        updateType: 'message_new',
        //groupId?: number;
      }),
      bot,
      this
    );
  }

  async startPooling() {
    await this.vk.updates.start();
  }
}

export { VkAttachment };