import type { Upload } from '@henta/core';
import type { Upload as VkUpload } from 'vk-io';

const methodByAttachmentType = {
  photo: 'messagePhoto',
  document: 'messageDocument',
  audio_message: 'audioMessage',
};

export function uploadFile(
  vkUpload: VkUpload,
  upload: Upload,
  peerId?: string,
) {
  const methodName = methodByAttachmentType[upload.type];
  if (!methodName) {
    throw new Error(`Upload method ${upload.type} not found`);
  }

  return vkUpload[methodName]({
    // пусть пока побудет так
    peer_id: peerId,
    source: {
      value: upload.data,
      contentType: upload.mime,
      filename: upload.name,
    },
  });
}
