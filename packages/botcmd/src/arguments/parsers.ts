import type { ArgumentRequest, ArgumentTypeParser } from './interfaces.js';

export const StringParser = {
  parse: (_ctx, args: string[], request: ArgumentRequest) => {
    if (request.toEnd) {
      return args.splice(0).join(' ');
    }

    return args.shift();
  },

  resolve: (_ctx, payload: string) => {
    return payload;
  }
} as ArgumentTypeParser<string>;