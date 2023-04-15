import type PlatformContext from '@henta/core/context';
import type { Attachment } from '@henta/core';
import type AttachmentHistory from '@henta/attachment-history/src/attachmentHistory';
import type IAttachmentRequest from './attachment-request.interface.js';
import AttachmentsNotFoundError from './attachments-not-found.error.js';
import type IFoundAttachment from './found-attachment-interface.js';

export function requestAttachments(
  rawAttachments: Attachment[],
  requests: IAttachmentRequest[],
): IFoundAttachment[] {
  const attachments: Attachment[] = [...rawAttachments];
  return requests.map((request) => {
    const foundIndex = attachments.findIndex((v) => v.type === request.type);
    if (foundIndex === -1) {
      return {
        request,
        isFailed: true,
      } as IFoundAttachment;
    }

    // removing it from the array, thus we will no longer be able to use it in this search
    const [value] = attachments.splice(foundIndex, 1);
    return { request, value, isFailed: false } as IFoundAttachment;
  });
}
