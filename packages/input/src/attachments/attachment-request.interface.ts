import type { AttachmentTypeUnion } from '@henta/core';
import type { Attachment } from '@henta/core';

export default interface IAttachmentRequest {
  type: AttachmentTypeUnion;
  isRequired?: boolean;
  to?: (attachment: Attachment) => any;
}
