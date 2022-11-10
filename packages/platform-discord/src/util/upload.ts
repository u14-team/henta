import { UploadStream } from '@henta/core/files';
import { AttachmentBuilder } from 'discord.js';

export async function buildAttachment(source: UploadStream) {
  return new AttachmentBuilder(source.data, {
    name: source.name
  });
}