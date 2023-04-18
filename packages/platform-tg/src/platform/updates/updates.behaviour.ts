import { UpdatesBehaviour } from '@henta/core';
import type TelegramPlatform from '..';

export default abstract class TelegramUpdatesBehaviour extends UpdatesBehaviour {
  public constructor(protected readonly platform: TelegramPlatform) {
    super();
  }
}
