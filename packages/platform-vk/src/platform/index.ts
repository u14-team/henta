import { Platform } from '@henta/core';
import { MessageContext, VK } from 'vk-io';
import type IVKPlatformOptions from '../types/options.interface';
import type VkUpdatesBehaviour from './updates/updates.behaviour';
import LongpollVkUpdatesBehaviour from './updates/longpoll-updates.behaviour';
import PlatformVkContext from '../context';
import VkMessagesBehaviour from './messages.behaviour';

export default class VkPlatform extends Platform {
  public readonly slug = 'vk';
  public readonly vk: VK;
  public readonly updatesBehaviour: VkUpdatesBehaviour;
  public readonly messagesBehaviour: VkMessagesBehaviour;

  public constructor(private readonly options: IVKPlatformOptions) {
    super();

    this.normalizeOptions();

    this.vk = new VK({
      token: options.token,
      webhookConfirmation: options.webhookConfirmation,
      webhookSecret: options.webhookSecret,
      apiLimit: 20,
      apiRequestMode: 'burst',
    });

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
        groupId: this.options.groupId,
      }),
      this,
    );
  }

  private normalizeOptions() {
    if (!this.options.token) {
      throw new Error('vk.io token is required');
    }

    this.options.updatesMode = this.options.updatesMode || 'longpoll';
  }

  private createUpdatesBehaviour() {
    switch (this.options.updatesMode) {
      case 'longpoll':
        return new LongpollVkUpdatesBehaviour(this);
      default:
        throw new Error(
          `Updates mode ${this.options.updatesMode} is not supported`,
        );
    }
  }
}
