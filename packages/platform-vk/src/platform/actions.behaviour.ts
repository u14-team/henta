import { ActionsBehaviour } from '@henta/core';
import type ISendMessageOptions from '@henta/core/src/sendMessageOptions';
import type { IMessageContextSendOptions, VK } from 'vk-io';
import getKeyboardButton from '../util/keyboard';

export default class VKActionsBehaviour extends ActionsBehaviour {
  public constructor(private readonly vk: VK) {
    super();
  }

  public async sendMessage(options: ISendMessageOptions, peerId: string) {
    const params: IMessageContextSendOptions = {
      peer_id: +peerId,
      message: options.text,
      random_id: Math.random(),
    };

    if (options.keyboard) {
      const keyboard = options.keyboard.map((row) =>
        row.map((v) => getKeyboardButton(v)),
      );

      options.keyboard = JSON.stringify({
        inline: true,
        buttons: keyboard,
      });
    }

    if (options.isParseLinks !== undefined) {
      params.dont_parse_links = !options.isParseLinks;
    }

    return void this.vk.api.messages.send(params);
  }

  public async deleteMessage(messageId: string, peerId: string) {
    return void this.vk.api.messages.delete({
      peer_id: +peerId,
      cmids: [+messageId],
      delete_for_all: true,
    });
  }
}
