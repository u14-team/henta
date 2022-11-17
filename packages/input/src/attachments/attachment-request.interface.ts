import type AttachmentType from '@henta/core/src/attachment-type.enum';

export default interface IAttachmentRequest {
  type: AttachmentType | string;
  key: string;
  isRequired?: boolean;
}