import type { Context, Platform, PlatformContext } from '@henta/core';
import type { Middleware } from 'middleware-io';
import { compose } from 'middleware-io';
import { applyAnswerMiddleware } from './utils';
import BotMode from './bot-mode.enum';
import type HentaBridge from './bridge';
import type { PlatformListener } from '@henta/core/src';
import HentaBotPlatforms from './platforms';

export default class HentaBot {
  public bridge?: HentaBridge;

  private middleware: Middleware<PlatformContext> = (ctx, next) => next();
  private answerMiddleware: Middleware<PlatformContext> = (ctx, next) => next();

  public readonly platforms = new HentaBotPlatforms(this);
  public readonly listeners = new Set<PlatformListener>();

  public constructor(public mode: BotMode = BotMode.Local) {}

  /** @deprecated use bot.platforms.add */
  public addPlatform(platform: Platform): void {
    return this.platforms.add(platform);
  }

  /** @deprecated use bot.platforms.get */
  public getPlatform(slug: string): Platform {
    return this.platforms.get(slug);
  }

  public dispatch(ctx: Context, force = false) {
    if (!force && this.mode !== BotMode.Worker && this.mode !== BotMode.Local) {
      this.bridge.dispatch({
        slug: ctx.source,
        serialized: ctx.serialize(),
        sendAt: Date.now(),
      });

      return;
    }

    applyAnswerMiddleware(ctx, this.answerMiddleware);
    this.middleware(ctx, async () => {});
  }

  public setMiddleware(steps: Middleware<PlatformContext>[]) {
    this.middleware = compose(steps);
  }

  public setAnswerMiddleware(steps: Middleware<PlatformContext>[]) {
    this.answerMiddleware = compose(steps);
  }

  /** @deprecated use bot.start() instead */
  public async run() {
    return this.start();
  }

  public async start() {
    if (this.mode !== BotMode.Local) {
      await this.initBridge();
    }

    if (this.mode !== BotMode.Worker) {
      for (const listener of this.listeners) {
        await listener.start();
      }

      if (!this.listeners.size) {
        console.warn(
          'No listeners found. Use bot.addListener(platformListener); to receive events.',
        );
      }
    }
  }

  public async stop() {
    if (this.mode !== BotMode.Worker) {
      for (const listener of this.listeners) {
        await listener.stop();
      }
    }
  }

  private async initBridge() {
    if (!this.bridge) {
      throw new Error('Cannot run in local mode because bridge is undefined');
    }

    await this.bridge.connect();

    if (this.mode !== BotMode.Gateway) {
      this.bridge.fetchUpdates((data) => this.dispatchFromBridge(data));
    }

    if (this.mode !== BotMode.Worker) {
      this.bridge.fetchUpdates((data) => this.dispatchFromBridge(data));
    }
  }

  private dispatchFromBridge({ slug, serialized, sendAt }): void {
    const platform = this.platforms.get(slug);
    if (!platform) {
      throw new Error(`Invalid platform slug ${slug}`);
    }

    const context = platform.contextFromSerializedData(serialized);
    context.ttw = Date.now() - sendAt;

    this.dispatch(context, true);
  }
}
