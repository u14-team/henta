import { Platform } from '@henta/core';
import type ITelegramPlatformOptions from '../types/options.interface';
import { Context, Telegraf } from 'telegraf';
import type TelegramUpdatesBehaviour from './updates/updates.behaviour';
import LongpollTelegramUpdatesBehaviour from './updates/longpoll-updates.behaviour';
import PlatformTgContext from '../context';
import TelegramMessagesBehaviour from './messages.behaviour';

export default class TelegramPlatform extends Platform {
  public readonly slug = 'tg';
  public readonly tg: Telegraf;
  public readonly updatesBehaviour: TelegramUpdatesBehaviour;
  public readonly messagesBehaviour: TelegramMessagesBehaviour;

  public constructor(private readonly options: ITelegramPlatformOptions) {
    super();

    this.normalizeOptions();
    this.tg = new Telegraf(this.options.token);
    this.updatesBehaviour = this.createUpdatesBehaviour();
    this.messagesBehaviour = new TelegramMessagesBehaviour(this.tg);
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

  private createUpdatesBehaviour() {
    switch (this.options.updatesMode) {
      case 'longpoll':
        return new LongpollTelegramUpdatesBehaviour(this);
      default:
        throw new Error(
          `Updates mode ${this.options.updatesMode} is not supported`,
        );
    }
  }
}
