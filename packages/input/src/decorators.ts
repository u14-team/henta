import type { Attachment } from "@henta/core";
import "reflect-metadata";
import { requireAttachments } from "./attachments/index.js";
import type IAttachmentRequest from "./attachments/attachment-request.interface.js";
import type { AttachmentTypeUnion } from "@henta/core/src/attachment-type.enum.js";

const attachmentRequestsMetadataKey = Symbol("attachment_requests");

export function AttachmentRequest(request: IAttachmentRequest | AttachmentTypeUnion, to?: (attachment: Attachment) => any) {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const requests = Reflect.getOwnMetadata(attachmentRequestsMetadataKey, target[propertyKey]) || [];
    requests.push({
      to,
      parameterIndex,
      request: {
        ...(typeof request === 'object' ? request : { type: request }),
        key: propertyKey,
      }
    });

    Reflect.defineMetadata(
      attachmentRequestsMetadataKey,
      requests,
      target[propertyKey],
    );
  }
}

export function getAttachmentRequests(fn: any) {
  return Reflect.getMetadata(attachmentRequestsMetadataKey, fn);
}

export async function requireInputArgs(fn: any, ctx, attachmentsHistory?) {
  const requests = Reflect.getMetadata(attachmentRequestsMetadataKey, fn);
  if (!requests) {
    return [];
  }

  const attachments = await requireAttachments(ctx, requests.map(v => v.request), attachmentsHistory);
  const toByKey = Object.fromEntries(requests.map(v => [v.request.key, v.to]));
  const promises = Object.entries(attachments)
    .map(([key, attachment]: [string, Attachment]) => toByKey[key]?.(attachment) || attachment);

  return Promise.all(promises);
}
