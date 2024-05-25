import { Platform } from '@henta/core';
import { MessageContext, VK } from 'vk-io';
import type IVKPlatformOptions from './types/options.interface';
import PlatformVkContext from './context';
import VkMessagesBehaviour from './behaviours/messages.behaviour';
import { type VKOptions } from 'vk-io/lib/types';

export default class VkPlatform extends Platform {
  public readonly slug = 'vk';
  public readonly vk: VK;
  public readonly messagesBehaviour = new VkMessagesBehaviour(this);

  public constructor(options: IVKPlatformOptions) {
    super();

    this.vk = options.vk instanceof VK && options.vk;
    if (!this.vk) {
      this.vk = this.createClient(
        options as IVKPlatformOptions & {
          vk?: Partial<VKOptions> & { token: string };
        },
      );
    }
  }

  public dispatch(payload: any) {
    const context = new PlatformVkContext(payload, this);
    this.emit('message', context);
  }

  public contextFromSerializedData(rawData: any) {
    return new PlatformVkContext(
      new MessageContext({
        payload: rawData,
        api: this.vk.api,
        upload: this.vk.upload,
        source: 'WEBSOCKET' as any,
        updateType: 'message_new',
        // groupId: this.vk.,
      }),
      this,
    );
  }

  private createClient(
    options: IVKPlatformOptions & {
      vk?: Partial<VKOptions> & { token: string };
    },
  ) {
    if (!options.vk) {
      options.vk = {
        token: options.token,
        webhookConfirmation: options.webhookConfirmation,
        webhookSecret: options.webhookSecret,
        apiLimit: 20,
        apiRequestMode: 'burst',
      };
    }

    return new VK(options.vk);
  }
}
