import BotError from '@henta/core/error';
import { IArgumentRequest } from './interfaces';

export default class ArgumentError extends BotError {
  constructor(
    message,
    public request: IArgumentRequest
  ) {
    super(message);
  }
}