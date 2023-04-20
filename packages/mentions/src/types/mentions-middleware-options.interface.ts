import type { PlatformContext } from '@henta/core';
import type NoMentionReason from './no-mention-reason.enum';

export default interface IMentionsMiddlewareOptions {
  mention: RegExp;
  noMentionCallback?: (
    ctx: PlatformContext,
    next,
    reason: NoMentionReason,
  ) => void;
}
