import type { PlatformContext } from '@henta/core';
import type IMentionsMiddlewareOptions from './types/mentions-middleware-options.interface';
import NoMentionReason from './types/no-mention-reason.enum';

export default function mentionsMiddleware(
  ctx: PlatformContext,
  next,
  options: IMentionsMiddlewareOptions,
) {
  if (ctx.text) {
    const [matchedMention] =
      ctx.text.toLowerCase().match(options.mention) || [];

    if (matchedMention) {
      ctx.text = ctx.text.replace(options.mention, '').trim();
      return next();
    }

    if (ctx.isChat) {
      return options.noMentionCallback?.(ctx, next, NoMentionReason.NoMatch);
    }
  }

  if (ctx.isChat && !ctx.payload) {
    return options.noMentionCallback?.(ctx, next, NoMentionReason.NoText);
  }

  return next();
}
