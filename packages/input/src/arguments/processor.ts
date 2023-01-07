import { IArgumentRequest, ArgumentTypeParser } from './interfaces.js';
import ArgumentError from './error.js';
import { IRequestContext } from '../decorators.js';

export default function requireArguments(context: IRequestContext) {
  const ctx = context.ctx;
  const params = context.items.map(item => item.payload as IArgumentRequest);

  const payloads: unknown[] = [];
  const args = ctx.commandLine.trim().split(' ');
  // remove whitespace
  if (!args[0]) {
    args.shift();
  }

  console.log(params)
  for (const param of params) {
    try {
      const parser: ArgumentTypeParser = typeof param.parser === 'function'
        ? new (param.parser as any)()
        : param.parser;

      const isTextRequired = parser.isTextRequired ?? true;
      if (isTextRequired && args.length === 0) {
        throw new ArgumentError(`Слишком мало аргументов!!!`, param);
      }

      const payload = parser.parse(ctx, args, param);
      payloads.push(payload);
    } catch (error) {
      if (error instanceof ArgumentError && !param.isRequired) {
        payloads.push(param.default || null);
      }

      throw error;
    }
  }

  return Promise.all(
    params.map(async (param, i) => {
      const payload = payloads[i];
      if (payload === null) {
        return param.default || null;
      }

      try {
        const parser: ArgumentTypeParser = typeof param.parser === 'function' ? new (param.parser as any)() : param.parser;
        return await parser.resolve(ctx, payload)
      } catch (error) {
        if (error instanceof ArgumentError && !param.isRequired) {
          return null;
        }

        throw error;
      }
    })
  );
}