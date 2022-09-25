import PlatformContext from '@henta/core/context';
import DiscordAttachment from './attachment.js';
import type HentaBot from '@henta/core';
import { CacheType, ChatInputCommandInteraction, Attachment, AttachmentBuilder } from 'discord.js';

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

  async send(message) {
    let attachments: any[];
    if (message.attachments?.length) {
      attachments = await this.loadAttachments(message.attachments);
    }

    const attachment = attachments ? await Promise.all(attachments.map(async source => new AttachmentBuilder(
      typeof source.data === 'string' ? await fetch(source.data).then(v => v.body) as any : source.data,
      { name: 'tet.jpg' }
      ))) : [];

    if (this.sendedAnswer) {
      return this.raw.editReply({
        content: message.text,
        files: attachment
      });
    }

    return this.raw.reply({
      content: message.text,
      files: attachment
    });
    /*let attachments: any[];
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
    });*/
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