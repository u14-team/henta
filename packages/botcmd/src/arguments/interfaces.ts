export interface ArgumentRequest {
  name: string;
  isRequired?: boolean;
  parser: ArgumentTypeParser | typeof ArgumentTypeParser;
  [key: string]: any;
}

export abstract class ArgumentTypeParser<T = unknown> {
  isTextRequired = false;

  abstract parse (ctx, args, request: ArgumentRequest): unknown;
  abstract resolve (ctx, payload): Promise<T> | T;
}