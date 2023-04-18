import type { Platform } from '@henta/core';
import type { IHistoryAttachment } from './attachmentHistory.js';
import type IAttachmentHistoryStorage from './storage.interface.js';

export default class LocalAttachmentHistoryStorage
  implements IAttachmentHistoryStorage
{
  values: IHistoryAttachment[] = [];

  get(platform: Platform, peerId: string, limit: number) {
    return [...this.values]
      .reverse()
      .filter(
        (value) => value.peerId === peerId && value.source === platform.slug,
      )
      .splice(0, limit);
  }

  insert(...values: IHistoryAttachment[]) {
    this.values.push(...values);
  }
}
