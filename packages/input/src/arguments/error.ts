import { BotError } from '@henta/core';
import type { IArgumentRequest } from './interfaces';

export default class ArgumentError extends BotError {
  constructor(message, public request: IArgumentRequest) {
    super(message);
  }
}
