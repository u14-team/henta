import BotError from '@henta/core/error';
import type IAttachmentRequest from './attachment-request.interface';

export default class AttachmentsNotFoundError extends BotError {
  constructor(public readonly requests: IAttachmentRequest[]) {
    super(`attachments not found: ${requests.map(v => `<${v.key}/${v.type}>`).join(', ')}.`);
    this.requests = requests;
  }
}