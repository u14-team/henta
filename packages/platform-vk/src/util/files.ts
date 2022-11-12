import type { Upload } from '@henta/core/files';
import type PlatformVkContext from '../context.js';

function buildMethod(method: string) {
  return (ctx: PlatformVkContext, upload: Upload) =>
    ctx.platform.vk.upload[method]({
      peer_id: ctx.peerId,
      source: { value: upload.data }
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

  console.log(`Loading file`, upload);
  return method(ctx, upload);
}
