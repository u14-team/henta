import { requireInputArgs } from '@henta/input';
import type BotCmdContext from './botcmdContext';
import type AttachmentHistory from '@henta/attachment-history';

export async function requestInputArgsMiddleware(
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
