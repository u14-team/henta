import type { MessageContext } from 'vk-io';
import PlatformContext from '@henta/core/context';
import type HentaBot from '@henta/core';
import getKeyboardButton from './util/keyboard.js';
import BotError from '@henta/core/error';

export default class PlatformVkContext extends PlatformContext {
  source = 'vk';
  declare raw: MessageContext;

  constructor(raw: MessageContext, bot: HentaBot) {
    super(raw, bot);
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

  requireAttachments(attachments: any[]) {
    if (attachments.length === 0) {
      return [];
    }

    const allAttachments = [...this.raw.attachments];
    if (this.raw.hasReplyMessage) {
      allAttachments.push(...this.raw.replyMessage.attachments);
    }

    if (this.raw.hasForwards) {
      this.raw.forwards.forEach(v => allAttachments.push(...v.attachments));
    }

    const foundList = [];
    attachments.forEach(attachment => {
      const foundIndex = allAttachments.findIndex(v => v.type === attachment.type);
      if (foundIndex === -1) {
        throw new BotError('Вы не прикрепили все требуемые медиафайлы.');
      }

      const [found] = allAttachments.splice(foundIndex, 1);
      let value = found;
      if (attachment.to === 'url') {
        value = found.largeSizeUrl;
      }

      foundList.push(value);
    });

    return Promise.all(foundList);
  }
}