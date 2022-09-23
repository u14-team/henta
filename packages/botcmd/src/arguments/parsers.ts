import type { ArgumentTypeParser } from './interfaces.js';

export const StringParser = {
  parse: (_ctx, args: string[]) => {
    return args.shift();
  },

  resolve: (_ctx, payload: string) => {
    return payload;
  }
} as ArgumentTypeParser<string>;