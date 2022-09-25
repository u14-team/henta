export interface ArgumentRequest {
  name: string;
  isRequired?: boolean;
  parser: ArgumentTypeParser;
}

export interface ArgumentTypeParser<T = unknown> {
  parse: (ctx, args) => unknown;
  resolve: (ctx, payload) => Promise<T> | T;
}