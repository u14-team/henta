import type Platform from '@henta/core/platform';
import type { IHistoryAttachment } from './attachmentHistory.js';

export default interface IAttachmentHistoryStorage {
  get(platform: Platform, peerId: string, limit: number): Promise<IHistoryAttachment[]> | IHistoryAttachment[];
  insert(...values: IHistoryAttachment[]): Promise<void> | void;
}
