import PlatformContext from '@henta/core/context';
import DiscordAttachment from './attachment.js';
import type HentaBot from '@henta/core';
import { CacheType, ChatInputCommandInteraction, MessagePayload } from 'discord.js';
import { buildAttachment } from './util/upload.js';
import { normalizeUploads, UploadSourceType, UploadStream } from '@henta/core/files';
import { ISendMessageOptions } from '@henta/core';
import { getKeyboardData } from './util/keyboard.js';

export default class DiscordPlatformContext extends PlatformContext {
  source = 'discord';
  declare raw: ChatInputCommandInteraction<CacheType>;

  constructor(raw: ChatInputCommandInteraction<CacheType>, bot: HentaBot, platform: any) {
    super(raw, bot, platform);
    this.text = this.originalText;
  }

  get peerId() {
    return this.raw.channelId;
  }

  get originalText() {
    const subcommand = this.raw.options?._subcommand;
    return [
      `/${this.raw.commandName}`,
      // Обзор в дискорде юзается как базовая команда
      subcommand !== 'обзор' && subcommand,
      ...this.raw.options['_hoistedOptions']
        .filter(option => option.type === 1)
        .map(option => option.value)
    ].filter(v => !!v).join(' ');
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

    const body = {
      content: message.text,
      components: getKeyboardData(this, message),
      files
    } as unknown as MessagePayload;

    if (this.sendedAnswer) {
      return this.raw.editReply(body);
    }

    return this.raw.reply(body);
  }

  get payload() {
    return this.raw.customId && JSON.parse(this.raw.customId);
  }

  get isChat() {
    return true;
  }

  get attachments() {
    if (!this.raw.options) {
      return [];
    }

    return this.raw.options['_hoistedOptions']
      .filter(option => option.type === 11)
      .map(option => new DiscordAttachment('photo', option.attachment, this.platform));
  }

  get nestedAttachments() {
    return [];
  }
}
