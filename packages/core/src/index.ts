import { compose, Middleware } from 'middleware-io';
import type Platform from './platform.js';
import type PlatformContext from './context.js';

export default class HentaBot {
  private _middlewares: Middleware<PlatformContext>[] = [];
  private _composed: Middleware<PlatformContext>;

  subscribe(platform: Platform) {
    platform.setCallback(ctx => this._composed(ctx, async () => {}))
  }

  use(middleware: Middleware<PlatformContext>) {
    this._middlewares.push(middleware);
    this._composed = compose(this._middlewares);
  }
}