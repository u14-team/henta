import type { UploadStream } from '@henta/core';
import { AttachmentBuilder } from 'discord.js';
import type { Stream } from 'node:stream';

export async function buildAttachment(source: UploadStream) {
  return new AttachmentBuilder(source.data as unknown as Stream, {
    name: source.name,
  });
}
