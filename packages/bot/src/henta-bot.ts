import type { Platform, PlatformContext } from '@henta/core';
import type { Middleware } from 'middleware-io';
import { compose } from 'middleware-io';
import { applyAnswerMiddleware } from './utils';
import BotMode from './bot-mode.enum';
import type HentaBridge from './bridge';

export default class HentaBot {
  public bridge?: HentaBridge;

  private middleware: Middleware<PlatformContext> = (ctx, next) => next();
  private answerMiddleware: Middleware<PlatformContext> = (ctx, next) => next();

  private readonly platforms = new Map<string, Platform>();

  public constructor(public mode: BotMode = BotMode.Local) {}

  public addPlatform(platform: Platform): void {
    platform.updatesBehaviour.on('message', (ctx) => this.dispatch(ctx));
    this.platforms.set(platform.slug, platform);
  }

  public dispatch(ctx: PlatformContext, force = false) {
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

  public async run() {
    if (this.mode !== BotMode.Local) {
      await this.initBridge();
    }

    if (this.mode !== BotMode.Worker) {
      for (const platform of this.platforms.values()) {
        await platform.updatesBehaviour.run();
      }
    }

    process.once('SIGINT', () => this.stop());
    process.once('SIGTERM', () => this.stop());
  }

  public async stop() {
    if (this.mode !== BotMode.Worker) {
      for (const platform of this.platforms.values()) {
        await platform.updatesBehaviour.stop();
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
