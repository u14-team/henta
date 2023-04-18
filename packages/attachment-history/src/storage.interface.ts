import type { Platform } from '@henta/core';
import type { IHistoryAttachment } from './attachmentHistory.js';

export default interface IAttachmentHistoryStorage {
  get(
    platform: Platform,
    peerId: string,
    limit: number,
    types: string[],
  ): Promise<IHistoryAttachment[]> | IHistoryAttachment[];
  insert(...values: IHistoryAttachment[]): Promise<void> | void;
}
