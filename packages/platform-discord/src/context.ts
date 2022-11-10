import PlatformContext from '@henta/core/context';
import DiscordAttachment from './attachment.js';
import type HentaBot from '@henta/core';
import { CacheType, ChatInputCommandInteraction, Attachment, AttachmentBuilder } from 'discord.js';
import { buildAttachment } from './util/upload.js';
import { normalizeUploads, UploadSourceType, UploadStream } from '@henta/core/files';
import { ISendMessageOptions } from '@henta/core';

export default class DiscordPlatformContext extends PlatformContext {
  source = 'discord';
  declare raw: ChatInputCommandInteraction<CacheType>;

  constructor(raw: ChatInputCommandInteraction<CacheType>, bot: HentaBot, platform: any) {
    super(raw, bot, platform);
    this.text = this.originalText;
  }

  get originalText() {
    return `/${this.raw.commandName}`;
  }

  get senderId() {
    return this.raw.user.id;
  }

  async send(message: ISendMessageOptions) {
    let files;
    if (message.files && message.files.length) {
      const normalizedFiles = await normalizeUploads(message.files, [UploadSourceType.Stream]);
      files = await Promise.all(normalizedFiles.map(async source => buildAttachment(source as UploadStream)));
    }

    if (this.sendedAnswer) {
      return this.raw.editReply({
        content: message.text,
        files
      });
    }

    return this.raw.reply({
      content: message.text,
      files
    });
  }

  get payload() {
    // TODO
    return {};
  }

  get isChat() {
    return true;
  }

  get attachments() {
    return this.raw.options['_hoistedOptions']
      .filter(option => option.type === 11)
      .map(option => new DiscordAttachment('photo', option.attachment, this.platform));
  }

  get nestedAttachments() {
    return [];
  }
}
