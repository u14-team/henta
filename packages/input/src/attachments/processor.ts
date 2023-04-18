import { requestAttachments } from '.';
import type { IRequestContext } from '../decorators';
import type IAttachmentRequest from './attachment-request.interface';
import AttachmentsNotFoundError from './attachments-not-found.error';

export default async function requireAttachments(
  context: IRequestContext<IAttachmentRequest>,
) {
  if (context.items.length === 0) {
    return [];
  }

  let foundList = requestAttachments(
    [...context.ctx.attachments, ...context.ctx.nestedAttachments],
    context.items.map((v) => v.payload),
  );

  let failedAttachments = foundList.filter((v) => v.isFailed);
  if (context.attachmentsHistory && failedAttachments.length) {
    const foundFromHistory = await context.attachmentsHistory
      .request(
        context.ctx.platform,
        context.ctx.peerId,
        failedAttachments.length,
        failedAttachments.map((v) => v.request.type),
      )
      .catch(() => []);

    foundList = [
      ...foundList.filter((v) => !v.isFailed),
      ...requestAttachments(
        foundFromHistory,
        failedAttachments.map((v) => v.request),
      ),
    ];

    failedAttachments = foundList.filter((v) => v.isFailed);
  }

  const requiredFailedAttachments = failedAttachments.filter(
    (v) => v.request.isRequired ?? true,
  );

  if (requiredFailedAttachments.length > 0) {
    throw new AttachmentsNotFoundError(
      requiredFailedAttachments.map((v) => v.request),
    );
  }

  const promises = foundList.map(async (item) => {
    if (item.request.to) {
      return item.request.to(item.value);
    }

    return item.value;
  });

  return Promise.all(promises);
}
