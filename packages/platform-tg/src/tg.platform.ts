import { Platform } from '@henta/core';
import { Telegraf, Context } from 'telegraf';
import PlatformTgContext from './context';
import TelegramMessagesBehaviour from './platform/messages.behaviour';
import type ITelegramPlatformOptions from './types/options.interface';

export default class TgPlatform extends Platform {
  public readonly slug = 'tg';
  public readonly telegraf: Telegraf;
  public readonly messagesBehaviour: TelegramMessagesBehaviour;

  public constructor(private readonly options: ITelegramPlatformOptions) {
    super();

    this.normalizeOptions();
    this.telegraf = new Telegraf(this.options.token);
    this.messagesBehaviour = new TelegramMessagesBehaviour(this.telegraf);
  }

  /** @deprecated use .telegraf */
  public get tg() {
    return this.telegraf;
  }

  public contextFromSerializedData(rawData: any) {
    return new PlatformTgContext(
      new Context(rawData, this.tg.telegram, this.tg.botInfo),
      this,
    );
  }

  private normalizeOptions() {
    if (!this.options.token) {
      throw new Error('Telegraf token is required');
    }

    this.options.updatesMode = this.options.updatesMode || 'longpoll';
  }

  public dispatch(payload: any) {
    const context = new PlatformTgContext(payload, this);
    this.emit('message', context);
  }
}
