import type { Upload } from '@henta/core/files';
import type PlatformVkContext from '../context.js';

function buildMethod(method: string) {
  return (ctx: PlatformVkContext, upload: Upload) =>
    ctx.platform.vk.upload[method]({
      // пусть пока побудет так
      peer_id: ctx.senderId,
      source: { value: upload.data, contentType: upload.mime, filename: upload.name },
    });
}

const methodByAttachmentType = {
  photo: buildMethod('messagePhoto'),
  document: buildMethod('messageDocument'),
  audio_message: buildMethod('audioMessage'),
};

export function uploadFile(ctx: PlatformVkContext, upload: Upload) {
  const method = methodByAttachmentType[upload.type];
  if (!method) {
    throw new Error(`Upload method ${upload.type} not found`);
  }

  return method(ctx, upload);
}
