import { compose, Middleware } from 'middleware-io';
import type Platform from './platform/platform.js';
import type PlatformContext from './context.js';
import Attachment from './attachment.js';
import type ISendMessageOptions from './sendMessageOptions.js';
import KB from './util/kb.js';
import EventEmitter from 'node:events';

export default class HentaBot extends EventEmitter {
  private _middlewares: Middleware<PlatformContext>[] = [];
  private _composed: Middleware<PlatformContext>;
  private _answerMiddlewares: Middleware<PlatformContext>[] = [];
  private _answerComposed: Middleware<PlatformContext> = (ctx, next) => next();
  public readonly platforms: Platform[] = [];

  public addPlatform(platform: Platform) {
    this.platforms.push(platform);
  }

  public dispatch(ctx: PlatformContext) {
    this._composed(ctx, async () => {});
  }

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

export { Attachment, ISendMessageOptions, KB };