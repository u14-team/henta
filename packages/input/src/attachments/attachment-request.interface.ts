import type { AttachmentTypeUnion } from '@henta/core/src/attachment-type.enum';
import type { Attachment } from '@henta/core';

export default interface IAttachmentRequest {
  type: AttachmentTypeUnion;
  isRequired?: boolean;
  to?: (attachment: Attachment) => any;
}
