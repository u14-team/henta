import type { MessageContext } from 'vk-io';
import PlatformContext from '@henta/core/context';
import type HentaBot from '@henta/core';
import getKeyboardButton from './util/keyboard.js';
import BotError from '@henta/core/error';
import VkAttachment from './attachment.js';
import type PlatformVk from './index.js';
import type { ISendMessageOptions } from '@henta/core';
import { normalizeUploads, Upload, UploadSourceType, UploadStream } from '@henta/core/files';

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

  get senderId() {
    return this.raw.senderId.toString();
  }

  async send(message: ISendMessageOptions) {
    let files: Upload[];
    if (message.files?.length) {
      files = await normalizeUploads(message.files);
    }

    const methodByAttachmentType = {
      photo: this.platform.vk.upload.messagePhoto.bind(this.platform.vk.upload),
      document: this.platform.vk.upload.messageDocument.bind(this.platform.vk.upload)
    };

    const attachment = files ? await Promise.all(files.map(source => (
      methodByAttachmentType[source.type]({
        source: { value: source.data },
        peer_id: this.raw.peerId
      })
    ))) : [];

    const messageBody = {
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
        buttons: this.normalizeKeyboard(message.keyboard).map(row => row.map(v => getKeyboardButton(v)))
      })
    };

    if (this.sendedAnswer) {
      return this.sendedAnswer.editMessage(messageBody);
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