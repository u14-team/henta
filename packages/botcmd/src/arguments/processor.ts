import { ArgumentRequest } from './interfaces.js';
import PlatformContext from '@henta/core/context';
import ArgumentError from './error.js';
import BotError from '@henta/core/error';

export default function requireArguments(ctx: PlatformContext, params: ArgumentRequest[]) {
  const payloads: unknown[] = [];
  const args = ctx.commandLine.substring(ctx.commandName.length).split(' ');
  if (!args[0]) {
    args.shift();
  }

  for (const param of params) {
    try {
      const isTextRequired = param.parser.isTextRequired ?? true;
      if (isTextRequired && args.length === 0) {
        throw new BotError(`Слишком мало аргументов!!!`);
      }

      const payload = param.parser.parse(ctx, args);
      payloads.push(payload);
    } catch (error) {
      if (error instanceof ArgumentError) {
        if (!param.isRequired) {
          payloads.push(null);
        }

        throw new BotError(`Аргумент ${param.name}: ${error.message}`);
      }

      throw error;
    }
  }

  return Promise.all(
    params.map(async (param, i) => {
      const payload = payloads[i];
      if (payload === null) {
        return null;
      }

      try {
        return await param.parser.resolve(ctx, payload)
      } catch (error) {
        if (error instanceof ArgumentError) {
          if (!param.isRequired) {
            return null;
          }

          throw new BotError(`Аргумент ${param.name}: ${error.message}`);
        }

        throw error;
      }
    })
  );
}