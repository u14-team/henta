import type { ISendMessageOptions } from '@henta/core';
import { MessagesBehaviour } from '@henta/core';
import type { IMessageContextSendOptions, VK } from 'vk-io';
import getKeyboardButton from '../util/keyboard';

export default class VkMessagesBehaviour extends MessagesBehaviour {
  public constructor(private readonly vk: VK) {
    super();
  }

  public async sendMessage(
    options: ISendMessageOptions,
    peerId: string,
  ): Promise<string> {
    const message = await this.vk.api.messages.send(
      this.prepareMessageParams(options, peerId),
    );

    return message.toString();
  }

  public async editMessage(
    options: ISendMessageOptions,
    messageId: string,
    peerId: string,
  ): Promise<void> {
    const params = this.prepareMessageParams(options, peerId);

    await this.vk.api.messages.edit({
      ...params,
      message_id: parseInt(messageId),
      peer_id: params.peer_id,
    });
  }

  public async deleteMessage(messageId: string, peerId: string): Promise<void> {
    await this.vk.api.messages.delete({
      peer_id: parseInt(peerId),
      cmids: [parseInt(messageId)],
      delete_for_all: true,
    });
  }

  private prepareMessageParams(
    options: ISendMessageOptions,
    peerId: string,
  ): IMessageContextSendOptions {
    const params: IMessageContextSendOptions = {
      peer_id: parseInt(peerId),
      message: options.text,
      random_id: Math.random(),
    };

    if (options.keyboard) {
      const keyboard = options.keyboard.map((row) =>
        row.map((v) => getKeyboardButton(v)),
      );

      params.keyboard = JSON.stringify({
        buttons: keyboard,
        inline: true,
      });
    }

    if (options.isParseLinks !== undefined) {
      params.dont_parse_links = !options.isParseLinks;
    }

    return params;
  }
}
