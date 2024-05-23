import { Platform } from '@henta/core';
import { MessageContext, VK } from 'vk-io';
import type IVKPlatformOptions from '../types/options.interface';
import type VkUpdatesBehaviour from './updates/updates.behaviour';
import LongpollVkUpdatesBehaviour from './updates/longpoll-updates.behaviour';
import PlatformVkContext from '../context';
import VkMessagesBehaviour from './messages.behaviour';
import { type VKOptions } from 'vk-io/lib/types';

export default class VkPlatform extends Platform {
  public readonly slug = 'vk';
  public readonly vk: VK;
  public readonly updatesBehaviour: VkUpdatesBehaviour;
  public readonly messagesBehaviour: VkMessagesBehaviour;

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

    this.updatesBehaviour = this.createUpdatesBehaviour();
    this.messagesBehaviour = new VkMessagesBehaviour(this.vk);
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

  private createUpdatesBehaviour() {
    return new LongpollVkUpdatesBehaviour(this);
  }
}
