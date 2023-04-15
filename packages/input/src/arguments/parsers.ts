import ArgumentError from './error.js';
import type { IArgumentRequest } from './interfaces.js';
import { ArgumentTypeParser } from './interfaces.js';

export interface StringParserOptions {
  toEnd: boolean;
}

export class StringParser extends ArgumentTypeParser<string> {
  public isTextRequired = true;

  public constructor(private options: StringParserOptions = { toEnd: false }) {
    super();
  }

  public parse(_ctx, args: string[], request: IArgumentRequest) {
    if (this.options.toEnd) {
      return args.splice(0).join(' ');
    }

    return args.shift();
  }

  public resolve(_ctx, payload: string) {
    return payload;
  }
}

export interface INumberParserOptions {
  min?: number;
}

export class NumberParser extends ArgumentTypeParser<number> {
  public isTextRequired = true;

  public constructor(private options: INumberParserOptions = {}) {
    super();
  }

  public parse(_ctx, args: string[], request: IArgumentRequest) {
    const number = parseFloat(args.shift());
    if (!Number.isFinite(number)) {
      throw new ArgumentError('input is not a finite number', request);
    }

    if (this.options.min !== undefined && number < this.options.min) {
      throw new ArgumentError('the number must be greater than zero', request);
    }

    return number;
  }

  public resolve(_ctx, payload: number) {
    return payload;
  }
}

export class IntParser extends NumberParser {
  public isTextRequired = true;

  public constructor(options: INumberParserOptions = {}) {
    super(options);
  }

  public parse(_ctx, args: string[], request: IArgumentRequest) {
    const number = super.parse(_ctx, args, request);
    return Math.floor(number);
  }
}
