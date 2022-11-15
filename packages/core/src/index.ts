import { compose, Middleware } from 'middleware-io';
import type Platform from './platform.js';
import type PlatformContext from './context.js';
import Attachment from './attachment.js';
import type ISendMessageOptions from './sendMessageOptions.js';

export default class HentaBot {
  private _middlewares: Middleware<PlatformContext>[] = [];
  private _composed: Middleware<PlatformContext>;
  private _answerMiddlewares: Middleware<PlatformContext>[] = [];
  private _answerComposed: Middleware<PlatformContext> = (ctx, next) => next();

  subscribe(platform: Platform) {
    platform.setCallback(ctx => this._composed(ctx, async () => {}), this);
  }

  use(middleware: Middleware<PlatformContext>) {
    this._middlewares.push(middleware);
    this._composed = compose(this._middlewares);
  }

  useAnswer(middleware: Middleware<PlatformContext>) {
    this._answerMiddlewares.push(middleware);
    this._answerComposed = compose(this._answerMiddlewares);
  }

  async onAnswer(ctx: PlatformContext) {
    try {
      return await this._answerComposed(ctx, () => ctx.send(ctx.answerBody, true));
    } catch (error) {
      console.error('answer:', error.stack);
    }
  }
}

export { Attachment, ISendMessageOptions };