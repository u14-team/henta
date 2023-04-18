import type { Attachment } from '@henta/core';
import type IAttachmentRequest from './attachment-request.interface';

export default interface IFoundAttachment {
  request: IAttachmentRequest;
  isFailed: boolean;
  value: Attachment;
}
