import type { Attachment, PlatformContext } from '@henta/core';
import 'reflect-metadata';
import type IAttachmentRequest from './attachments/attachment-request.interface.js';
import type { AttachmentTypeUnion } from '@henta/core';
import type AttachmentHistory from '@henta/attachment-history';
import type { IArgumentRequest } from './arguments/interfaces.js';
import { StringParser } from './arguments/parsers.js';
import requireArguments from './arguments/processor.js';
import requireAttachments from './attachments/processor.js';

const inputRequestsMetadataKey = Symbol('input_requests');

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

/** same as `ArgumentRequest({ parser: new StringParser({ toEnd: true }) });` */
export function CommandLineRequest(defaultValue?: string | null) {
  if (defaultValue === null) {
    return ArgumentRequest({
      parser: new StringParser({ toEnd: true }),
      isRequired: false,
    });
  }

  return ArgumentRequest({
    parser: new StringParser({ toEnd: true }),
    default: defaultValue,
  });
}

export function AttachmentRequest(
  requestOrType: IAttachmentRequest | AttachmentTypeUnion,
  to?: (attachment: Attachment) => any,
) {
  const request: IAttachmentRequest =
    typeof requestOrType === 'string' ? { type: requestOrType } : requestOrType;

  if (to) {
    request.to = to;
  }

  return CustomRequest(requireAttachments, request);
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
}
