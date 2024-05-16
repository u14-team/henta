import { requireInputArgs } from '@henta/input';
import type AttachmentHistory from '@henta/attachment-history';
import type { BotCmdContext } from '..';

export default async function requestInputArgsMiddleware(
  ctx: BotCmdContext,
  next,
  attachmentHistory?: AttachmentHistory,
) {
  ctx.botcmdData.args = await requireInputArgs(
    ctx.botcmdData.command.value,
    ctx,
    attachmentHistory,
  );

  return next();
}
