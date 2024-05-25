import { PlatformListener } from '@henta/core';
import type TgPlatform from '../tg.platform';
import type { Telegraf } from 'telegraf';

export default class LongpollTgListener extends PlatformListener<TgPlatform> {
  private readonly dispatch: (data: any) => void;

  public constructor(
    platform: TgPlatform,
    private readonly config: Telegraf.LaunchOptions = {},
  ) {
    super(platform);
    this.dispatch = (data) => this.platform.dispatch(data);
  }

  public async start(): Promise<void> {
    this.platform.telegraf.botInfo ??=
      await this.platform.telegraf.telegram.getMe();

    // await this.platform.telegraf.telegram.deleteWebhook({
    //   drop_pending_updates: config.dropPendingUpdates,
    // });

    this.platform.telegraf.on('message', this.dispatch);
    this.platform.telegraf.on('callback_query', this.dispatch);

    this.platform.telegraf['startPolling'](this.config.allowedUpdates);
  }

  public async stop(): Promise<void> {
    this.platform.telegraf['polling'].stop();
  }
}
