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

  for (const param of params) {
    try {
      const isTextRequired = param.parser.isTextRequired ?? true;
      if (isTextRequired && args.length === 0) {
        throw new ArgumentError(`Слишком мало аргументов!!!`, param);
      }

      const payload = param.parser.parse(ctx, args, param);
      payloads.push(payload);
    } catch (error) {
      if (error instanceof ArgumentError && !param.isRequired) {
        payloads.push(param.default || null);
        continue;
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
        return await param.parser.resolve(ctx, payload)
      } catch (error) {
        if (error instanceof ArgumentError && !param.isRequired) {
          return null;
        }

        throw error;
      }
    })
  );
}