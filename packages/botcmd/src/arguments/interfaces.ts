export interface ArgumentRequest {
  name: string;
  isRequired?: boolean;
  parser: ArgumentTypeParser;
  [key: string]: any;
}

export interface ArgumentTypeParser<T = unknown> {
  parse: (ctx, args, request: ArgumentRequest) => unknown;
  resolve: (ctx, payload) => Promise<T> | T;
}