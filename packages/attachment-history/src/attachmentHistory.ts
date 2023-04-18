import type { PlatformContext } from '@henta/core';
import type { Attachment } from '@henta/core';
import type { Platform } from '@henta/core';
import type IAttachmentHistoryStorage from './storage.interface.js';

export interface IAttachmentHistoryRequestQuery {
  type: string;
  count: number;
}

export interface IAttachmentHistoryRequest {
  peerId: string;
  source: string;
  query: IAttachmentHistoryRequestQuery[];
}

export interface IHistoryAttachment {
  payload: unknown;
  source: string;
  peerId: string;
  type: string;
  // id?: string;
}

export interface IAttachmentHistoryResponse {
  items: IHistoryAttachment[];
}

export interface IAttachmentSerializer<T = Attachment, P = unknown> {
  serialize(attachment: T): P;
  deserialize(type: string, payload: P, platform): T;
}

export default class AttachmentHistory {
  private _serializers: { [key: string]: IAttachmentSerializer } = {};

  constructor(private readonly storage: IAttachmentHistoryStorage) {}

  setSerializer(source: string, serializer: IAttachmentSerializer) {
    this._serializers[source] = serializer;
  }

  async pushFromContext(ctx: PlatformContext) {
    const attachments = ctx.attachments;
    if (attachments.length === 0) {
      return;
    }

    const serializer = this._serializers[ctx.source];
    if (!serializer) {
      throw Error(`Attachment serializer ${ctx.source} not found`);
    }

    const historyAttachments: IHistoryAttachment[] = await Promise.all(
      attachments.map(async (attachment) => ({
        source: ctx.source,
        payload: serializer.serialize(attachment),
        peerId: ctx.peerId,
        type: attachment.type,
      })),
    );

    await this.storage.insert(...historyAttachments);
  }

  async request(
    platform: Platform,
    peerId: string,
    limit: number,
    types: string[] = null,
  ) {
    if (limit === 0) {
      return;
    }

    const serializer = this._serializers[platform.slug];
    if (!serializer) {
      throw Error(`Attachment serializer ${platform.slug} not found`);
    }

    const response = await this.storage.get(platform, peerId, limit, types);
    return response.map((item) =>
      serializer.deserialize(item.type, item.payload, platform),
    );
  }
}
