import type PlatformContext from '@henta/core/context';
import type { Attachment } from '@henta/core';
import type AttachmentHistory from '@henta/attachment-history/src/attachmentHistory';
import type IAttachmentRequest from './attachment-request.interface.js';
import AttachmentsNotFoundError from './attachments-not-found.error.js';
import type IFoundAttachment from './found-attachment-interface.js';

export function requestAttachments(rawAttachments: Attachment[], requests: IAttachmentRequest[]): IFoundAttachment[] {
  const attachments: Attachment[] = [...rawAttachments];
  return requests.map(request => {
    const foundIndex = attachments.findIndex(v => v.type === request.type);
    if (foundIndex === -1) {
      return {
        request,
        isFailed: true,
      } as IFoundAttachment;
    }

    // removing it from the array, thus we will no longer be able to use it in this search
    const [value] = rawAttachments.splice(foundIndex, 1);
    return { request, value, isFailed: false } as IFoundAttachment;
  });
}

export async function requireAttachments<T extends { [key: string]: Attachment }> (
  ctx: PlatformContext,
  requests: IAttachmentRequest[],
  attachmentHistory?: AttachmentHistory
): Promise<T> {
  if (requests.length === 0) {
    return {} as T;
  }

  let foundList = requestAttachments([
    ...ctx.attachments,
    ...ctx.nestedAttachments,
  ], requests);
  
  let failedAttachments = foundList.filter(v => v.isFailed);
  if (attachmentHistory && failedAttachments.length) {
    const foundFromHistory = await attachmentHistory.request(
      ctx.platform,
      ctx.peerId,
      failedAttachments.length,
      failedAttachments.map(v => v.request.type)
    ).catch(() => []);

    foundList = [
      ...foundList.filter(v => !v.isFailed),
      ...requestAttachments(foundFromHistory, failedAttachments.map(v => v.request))
    ];

    failedAttachments = foundList.filter(v => v.isFailed);
  }

  const requiredFailedAttachments = failedAttachments.filter(v => v.request.isRequired ?? true);
  if (requiredFailedAttachments.length > 0) {
    throw new AttachmentsNotFoundError(requiredFailedAttachments.map(v => v.request));
  }

  return Object.fromEntries(
    foundList.map(v => [v.request.key, v.value])
  ) as T;
}