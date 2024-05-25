import { type IUpdatesOptions, Updates, type MessageContext } from 'vk-io';
import type VkPlatform from '../vk.platform';
import { PlatformListener } from '@henta/core';

export interface ILongpollListenerOptions {
  updates?: Partial<IUpdatesOptions> | Updates;
}

export default class LongpollVkListener extends PlatformListener<VkPlatform> {
  private readonly updates: Updates;

  public constructor(
    platform: VkPlatform,
    options: ILongpollListenerOptions = {
      updates: {},
    },
  ) {
    super(platform);
    this.handleMessage = this.handleMessage.bind(this);

    if (options.updates instanceof Updates) {
      this.updates = options.updates;
    } else {
      this.updates = new Updates({
        ...this.platform.vk.updates['options'],
        ...options.updates,
        api: this.platform.vk.api,
        upload: this.platform.vk.upload,
      });
    }

    this.updates.on('message_new', this.handleMessage);
    this.updates.on('message_event', this.handleMessage);
  }

  public async start() {
    await this.updates.start();
  }

  public async stop(): Promise<void> {
    await this.updates.stop();
  }

  private handleMessage(data: MessageContext) {
    // If payload data has text field - it was definitely added by button,
    // so we return text to use it as a command.
    if (data.messagePayload?.text) {
      data.text = data.messagePayload.text;
    }

    this.platform.dispatch(data);
  }
}
