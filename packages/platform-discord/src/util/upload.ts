import { UploadStream } from '@henta/core/files';
import { AttachmentBuilder } from 'discord.js';
import { Stream } from 'node:stream';

export async function buildAttachment(source: UploadStream) {
  return new AttachmentBuilder(source.data as unknown as Stream, {
    name: source.name
  });
}