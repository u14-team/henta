import type { Platform } from '@henta/core';
import type HentaBot from './henta-bot';

export default class HentaBotPlatforms {
  private readonly list = new Set<Platform>();
  private readonly dispatch: HentaBot['dispatch'];

  public constructor(private readonly bot: HentaBot) {
    this.dispatch = this.bot.dispatch.bind(this.bot);
  }

  /**
   * add platform and subscribe to message event
   * @param platform platform to add
   * @example
   * ```js
   * const platform = new MyPlatform();
   * bot.platforms.add(platform);
   * ```
   */
  public add(platform: Platform) {
    this.list.add(platform);
    platform.on('message', this.dispatch);
  }

  public delete(platform: Platform) {
    platform.off('message', this.dispatch);
    return this.list.delete(platform);
  }

  public get(slug: string) {
    for (const platform of this.list) {
      if (platform.slug !== slug) {
        continue;
      }

      return platform;
    }
  }

  public get size() {
    return this.list.size;
  }

  public get [Symbol.iterator]() {
    return this.list[Symbol.iterator];
  }
}
