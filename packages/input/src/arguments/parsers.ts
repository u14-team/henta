import ArgumentError from './error.js';
import { IArgumentRequest, ArgumentTypeParser } from './interfaces.js';

export interface StringParserOptions {
  toEnd: boolean;
}

export class StringParser extends ArgumentTypeParser<string> {
  isTextRequired = true;
  options: StringParserOptions;

  constructor(options: StringParserOptions = { toEnd: false }) {
    super();
    this.options = options;
  }

  parse(_ctx, args: string[], request: IArgumentRequest) {
    if (this.options.toEnd) {
      return args.splice(0).join(' ');
    }

    return args.shift();
  }

  resolve(_ctx, payload: string) {
    return payload;
  }
}

export interface INumberParserOptions {
  min?: number;
}

export class NumberParser extends ArgumentTypeParser<number> {
  isTextRequired = true;

  constructor(private options: INumberParserOptions = {}) {
    super();
  }

  parse(_ctx, args: string[], request: IArgumentRequest) {
    const number = parseFloat(args.shift());
    if (!Number.isFinite(number)) {
      throw new ArgumentError(`input is not a finite number`, request);
    }

    if (this.options.min !== undefined && number < this.options.min) {
      throw new ArgumentError('the number must be greater than zero', request);
    }

    return number;
  }

  resolve(_ctx, payload: number) {
    return payload;
  }
}

export class IntParser extends NumberParser {
  isTextRequired = true;

  constructor(options: INumberParserOptions = {}) {
    super(options);
  }

  parse(_ctx, args: string[], request: IArgumentRequest) {
    const number = super.parse(_ctx, args, request);
    return Math.floor(number);
  }
}