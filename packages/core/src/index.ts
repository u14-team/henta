import { compose, Middleware } from 'middleware-io';
import type Platform from './platform.js';
import type PlatformContext from './context.js';

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

  onAnswer(ctx: PlatformContext) {
    return this._answerComposed(ctx, () => ctx.send(ctx.answerBody));
  }
}

export { default as Attachment } from './attachment.js';