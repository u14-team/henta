import { ArgumentRequest, ArgumentTypeParser } from './interfaces.js';

export interface StringParserOptions {
  toEnd: boolean;
}

export class StringParser extends ArgumentTypeParser<string> {
  options: StringParserOptions;

  constructor(options: StringParserOptions = { toEnd: false }) {
    super();
    this.options = options;
  }

  parse (_ctx, args: string[], request: ArgumentRequest) {
    if (request.toEnd) {
      return args.splice(0).join(' ');
    }

    return args.shift();
  }

  resolve(_ctx, payload: string) {
    return payload;
  }
}
