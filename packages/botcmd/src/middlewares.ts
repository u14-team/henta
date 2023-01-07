import { requireInputArgs } from '@henta/input';
import type BotCmdContext from './botcmdContext';

export async function requestInputArgsMiddleware(ctx: BotCmdContext, next) {
   ctx.botcmdData.args = await requireInputArgs(
    ctx.botcmdData.command.originalFn,
    ctx,
    ctx.botcmdData.botcmd.attachmentHistory
  );

  return next();
}

