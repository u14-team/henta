import type { ISendMessageOptions, PlatformContext } from '@henta/core';
import type { Middleware } from 'middleware-io';

export function applyAnswerMiddleware(
  ctx: PlatformContext,
  answerMiddleware: Middleware<PlatformContext>,
) {
  ctx.answer = async (options: ISendMessageOptions) => {
    ctx.isAnswered = true;
    ctx.answerBody = options;

    await answerMiddleware(ctx, async () => {
      ctx.sendedAnswer = await ctx.send(ctx.answerBody, true);
    });

    return ctx.sendedAnswer;
  };
}
