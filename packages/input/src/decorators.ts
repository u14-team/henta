import type { Attachment } from '@henta/core';
import 'reflect-metadata';
import type IAttachmentRequest from './attachments/attachment-request.interface.js';
import type { AttachmentTypeUnion } from '@henta/core/src/attachment-type.enum.js';
import type PlatformContext from '@henta/core/context';
import type AttachmentHistory from '@henta/attachment-history';
import type { IArgumentRequest } from './arguments/interfaces.js';
import { StringParser } from './arguments/parsers.js';
import requireArguments from './arguments/processor.js';

const inputRequestsMetadataKey = Symbol('input_requests');
const attachmentRequestsMetadataKey = Symbol('attachment_requests');

export interface IRequestContextItem<T = any> {
  handler: (context: IRequestContext) => Promise<unknown[]>;
  parameterIndex: number;
  payload: T;
}

export interface IRequestContext<T = any> {
  ctx: PlatformContext;
  items: IRequestContextItem<T>[];
  attachmentsHistory?: AttachmentHistory;
}

export function CustomRequest(
  handler: (context: IRequestContext) => Promise<any[]>,
  payload?,
) {
  return (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    const requests: IRequestContextItem[] =
      Reflect.getOwnMetadata(inputRequestsMetadataKey, target[propertyKey]) ||
      [];
    requests.unshift({
      handler,
      parameterIndex,
      payload,
    } as IRequestContextItem);

    Reflect.defineMetadata(
      inputRequestsMetadataKey,
      requests,
      target[propertyKey],
    );
  };
}

export function ArgumentRequest(params: Partial<IArgumentRequest> = {}) {
  return CustomRequest(requireArguments, {
    parser: new StringParser(),
    isRequired: params.default === undefined,
    ...params,
  } as IArgumentRequest);
}

export function AttachmentRequest(
  request: IAttachmentRequest | AttachmentTypeUnion,
  to?: (attachment: Attachment) => any,
) {
  return (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    const requests =
      Reflect.getOwnMetadata(
        attachmentRequestsMetadataKey,
        target[propertyKey],
      ) || [];

    requests.push({
      to,
      parameterIndex,
      request: {
        ...(typeof request === 'object' ? request : { type: request }),
        key: `#${requests.length + 1}`,
      },
    });

    Reflect.defineMetadata(
      attachmentRequestsMetadataKey,
      requests,
      target[propertyKey],
    );
  };
}

export function getAttachmentRequests(fn: any) {
  return Reflect.getMetadata(attachmentRequestsMetadataKey, fn);
}

export async function requireInputArgs(fn: any, ctx, attachmentsHistory?) {
  const requests = Reflect.getMetadata(
    inputRequestsMetadataKey,
    fn,
  ) as IRequestContextItem[];
  if (!requests?.length) {
    return [];
  }

  const groupedItems = new Map<any, IRequestContextItem[]>();
  for (const request of requests) {
    const requestItems = groupedItems.get(request.handler) || [];
    requestItems.push(request);
    groupedItems.set(request.handler, requestItems);
  }

  const response = [];
  await Promise.all(
    [...groupedItems.values()].map(async (items) => {
      const { handler } = items[0];
      const responses = await handler({
        ctx,
        items,
        attachmentsHistory,
      });

      responses.map((v, i) => (response[items[i].parameterIndex] = v));
    }),
  );

  return response.splice(1);

  /*
  const requests = Reflect.getMetadata(attachmentRequestsMetadataKey, fn);
  if (!requests) {
    return [];
  }

  const attachments = await requireAttachments(ctx, requests.map(v => v.request), attachmentsHistory);
  const toByKey = Object.fromEntries(requests.map(v => [v.request.key, v.to]));
  const promises = Object.entries(attachments)
    .map(([key, attachment]: [string, Attachment]) => toByKey[key]?.(attachment) || attachment);

  return Promise.all(promises);*/
}
