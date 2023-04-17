import { PlatformContext } from '@henta/core';
import DiscordAttachment from './attachment.js';
import type HentaBot from '@henta/core';
import type {
  CacheType,
  ChatInputCommandInteraction,
  MessagePayload,
} from 'discord.js';
import { buildAttachment } from './util/upload.js';
import type { UploadStream } from '@henta/core';
import { normalizeUploads, UploadSourceType } from '@henta/core';
import type { ISendMessageOptions } from '@henta/core';
import { getKeyboardData } from './util/keyboard.js';

export default class DiscordPlatformContext extends PlatformContext {
  source = 'discord';
  declare raw: ChatInputCommandInteraction<CacheType>;

  constructor(
    raw: ChatInputCommandInteraction<CacheType>,
    bot: HentaBot,
    platform: any,
  ) {
    super(raw, bot, platform);
    this.text = this.originalText;
  }

  get peerId() {
    return this.raw.channelId;
  }

  get originalText() {
    if (!this.raw.options) {
      return `/${this.raw.commandName}`;
    }

    const subcommand = this.raw.options['_subcommand'];
    const commandArgs = this.raw.options['_hoistedOptions']
      .filter((option) => option.type === 3)
      .map((option) => option.value);

    return [
      `/${this.raw.commandName}`,
      subcommand !== 'обзор' && subcommand,
      ...commandArgs,
    ]
      .filter((v) => !!v)
      .join(' ');
  }

  get senderId() {
    return this.raw.user.id;
  }

  async send(message: ISendMessageOptions) {
    let files;
    if (message.files && message.files.length) {
      const normalizedFiles = await normalizeUploads(message.files, [
        UploadSourceType.Stream,
      ]);
      files = await Promise.all(
        normalizedFiles.map(async (source) =>
          buildAttachment(source as UploadStream),
        ),
      );
    }

    const body = {
      content: message.text,
      components: getKeyboardData(this, message),
      files,
    } as unknown as MessagePayload;

    if (this.sendedAnswer) {
      return this.raw.editReply(body);
    }

    return this.raw.reply(body);
  }

  get payload() {
    const rawPayload = this.raw['customId'];
    if (!rawPayload) {
      return null;
    }

    return rawPayload;
  }

  get isChat() {
    return true;
  }

  get attachments() {
    if (!this.raw.options) {
      return [];
    }

    return this.raw.options['_hoistedOptions']
      .filter((option) => option.type === 11)
      .map(
        (option) =>
          new DiscordAttachment('photo', option.attachment, this.platform),
      );
  }

  get nestedAttachments() {
    return [];
  }

  serialize() {
    return this.raw['_rawData'];
  }
}
