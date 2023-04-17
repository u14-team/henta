import type { PlatformContext } from '@henta/core';

export interface IArgumentRequest {
  name?: string;
  isRequired?: boolean;
  parser: IArgumentTypeParser;
  error?: (ctx: PlatformContext) => unknown;
  default?: any;
  [key: string]: any;
}

export interface IArgumentTypeParser<T = unknown> {
  isTextRequired?: boolean;

  parse(ctx, args, request: IArgumentRequest): unknown;
  resolve(ctx, payload): Promise<T> | T;
}

export abstract class ArgumentTypeParser<T = unknown>
  implements IArgumentTypeParser<T>
{
  isTextRequired = false;

  abstract parse(ctx, args, request: IArgumentRequest): unknown;
  abstract resolve(ctx, payload): Promise<T> | T;
}
