export interface ArgumentRequest {
  name: string;
  isRequired: string;
  parser: ArgumentTypeParser;
}

export interface ArgumentTypeParser<T = unknown> {
  parse: (ctx, args) => unknown;
  resolve: (ctx, payload) => Promise<T> | T;
}