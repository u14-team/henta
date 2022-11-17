import type { AttachmentTypeUnion } from '@henta/core/src/attachment-type.enum';

export default interface IAttachmentRequest {
  type: AttachmentTypeUnion;
  key: string;
  isRequired?: boolean;
}