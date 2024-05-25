import { type MessageContext, type MessageEventContext } from 'vk-io';
import type { ISendMessageOptions } from '@henta/core';
import { PlatformContext } from '@henta/core';
import VkAttachment from './attachment.js';
import type VkPlatform from './vk.platform.js';

export default class PlatformVkContext extends PlatformContext {
  public readonly source = 'vk';
  public declare raw: MessageContext | MessageEventContext;

  public constructor(
    raw: MessageContext | MessageEventContext,
    platform: VkPlatform,
  ) {
    super(raw, null, platform);
    this.text = this.raw.text;
    this.payload = this.raw.messagePayload ?? this.raw.eventPayload;
  }

  public get originalText() {
    return this.raw.text;
  }

  public get senderId() {
    return (this.raw.senderId ?? this.raw.userId).toString();
  }

  public get peerId(): string {
    return this.raw.peerId.toString();
  }

  public get messageId(): string {
    return this.raw.conversationMessageId.toString();
  }

  public get isChat() {
    return this.raw.isChat;
  }

  public get attachments() {
    if (!this.raw.attachments) {
      return [];
    }

    return this.raw.attachments.map(
      (attachment) =>
        new VkAttachment(attachment.type, attachment.toJSON(), this.platform),
    );
  }

  public get nestedAttachments() {
    const response = [];

    if (this.raw.hasReplyMessage) {
      response.push(...this.raw.replyMessage.attachments);
    }

    if (this.raw.hasForwards) {
      this.raw.forwards.forEach((v) => response.push(...v.attachments));
    }

    return response.map(
      (attachment) =>
        new VkAttachment(attachment.type, attachment.toJSON(), this.platform),
    );
  }

  public serialize() {
    return this.raw['payload'];
  }

  // TODO: перенести в messagesBehaviour
  public async send(message: ISendMessageOptions, isAnswer = false) {
    const platform = this.platform as VkPlatform;
    if (this.sendedAnswer && isAnswer) {
      return platform.messagesBehaviour.edit(
        message,
        this.sendedAnswer,
        this.peerId,
      );
    }

    return platform.messagesBehaviour.send(message, this.peerId);
  }
}
