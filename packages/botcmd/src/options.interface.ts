import type PlatformContext from '@henta/core/context';
import type BaseAttachmentHistory from '@henta/attachment-history';
import type { Middleware } from 'middleware-io';

export default interface IBotCmdOptions {
  middlewares?: Middleware<PlatformContext>[];
  attachmentHistory?: BaseAttachmentHistory;
}