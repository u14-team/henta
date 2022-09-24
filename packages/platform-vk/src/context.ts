import type { MessageContext } from 'vk-io';
import PlatformContext from '@henta/core/context';
import type HentaBot from '@henta/core';
import getKeyboardButton from './util/keyboard.js';
import BotError from '@henta/core/error';
import VkAttachment from './attachment.js';

export default class PlatformVkContext extends PlatformContext {
  source = 'vk';
  declare raw: MessageContext;

  constructor(raw: MessageContext, bot: HentaBot, platform: any) {
    super(raw, bot, platform);
    this.text = this.raw.text;
  }

  get originalText() {
    return this.raw.text;
  }

  get senderId() {
    return this.raw.senderId.toString();
  }

  async send(message) {
    let attachments: any[];
    if (message.attachments?.length) {
      attachments = await this.loadAttachments(message.attachments);
    }

    const attachment = attachments ? await Promise.all(attachments.map(source => (
			this.raw.upload.messagePhoto({
				source: { value: source.data },
				peer_id: this.raw.peerId
			})
		))) : [];

    await this.raw.send({
      message: message.text,
      attachment,
      keyboard: message.keyboard && JSON.stringify({
        inline: true,
        buttons: this.normalizeKeyboard(message.keyboard).map(row => row.map(v => getKeyboardButton(v)))
      })
    });
  }

  get payload() {
    return this.raw.messagePayload;
  }

  get isChat() {
    return this.raw.isChat;
  }

  get attachments() {
    return this.raw.attachments
      .map(attachment => new VkAttachment(
        attachment.type,
        attachment.toJSON(),
        this.platform
      ));
  }

  get nestedAttachments() {
    const response = [];

    if (this.raw.hasReplyMessage) {
      response.push(...this.raw.replyMessage.attachments);
    }

    if (this.raw.hasForwards) {
      this.raw.forwards.forEach(v => response.push(...v.attachments));
    }

    return response
      .map(attachment => new VkAttachment(
        attachment.type,
        attachment.toJSON(),
        this.platform
      ));
  }
}