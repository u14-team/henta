import { IMessageContextSendOptions, MessageContext } from 'vk-io';
import PlatformContext from '@henta/core/context';
import type HentaBot from '@henta/core';
import getKeyboardButton from './util/keyboard.js';
import VkAttachment from './attachment.js';
import type PlatformVk from './index.js';
import type { ISendMessageOptions } from '@henta/core';
import { normalizeUploads, Upload } from '@henta/core/files';
import { uploadFile } from './util/files.js';

export default class PlatformVkContext extends PlatformContext {
  source = 'vk';
  declare raw: MessageContext;
  declare platform: PlatformVk;

  constructor(raw: MessageContext, bot: HentaBot, platform: any) {
    super(raw, bot, platform);
    this.text = this.raw.text;
  }

  get originalText() {
    return this.raw.text;
  }

  get peerId(): string {
    return this.raw.peerId.toString();
  }

  get senderId() {
    return this.raw.senderId.toString();
  }

  serialize() {
    return this.raw['payload'];
  }

  async send(message: ISendMessageOptions, isAnswer = false) {
    let attachment = [];
    if (message.files?.length) {
      const files = await normalizeUploads(message.files);
      attachment = await Promise.all(files.map(file => uploadFile(this, file)));
    }

    const forwardOptions = this.raw.conversationMessageId
      ? { conversation_message_ids: this.raw.conversationMessageId }
      : { message_ids: this.raw.id };

    const messageBody = {
      ...(this.isChat && isAnswer ? {
        forward: JSON.stringify({
          ...forwardOptions,

          peer_id: this.peerId,
          is_reply: true
        })
      } : {}),
      message: message.text,
      content_source: JSON.stringify({
        type: 'message',
        owner_id: this.raw.senderId,
        peer_id: this.raw.peerId,
        conversation_message_id: this.raw.conversationMessageId,
      }),
      attachment,
      dont_parse_links: !(message.isParseLinks ?? true),
      keyboard: message.keyboard && JSON.stringify({
        inline: true,
        buttons: this.normalizeKeyboard(message.keyboard, 4, 5, 10)
          .map(row => row.map(v => getKeyboardButton(v)))
      })
    } as IMessageContextSendOptions;

    if (this.sendedAnswer && isAnswer) {
      await this.sendedAnswer.editMessage(messageBody);
      return this.sendedAnswer;
    }

    return this.raw.send(messageBody);
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