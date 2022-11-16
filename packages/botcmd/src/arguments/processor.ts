import { ArgumentRequest, ArgumentTypeParser } from './interfaces.js';
import PlatformContext from '@henta/core/context';
import ArgumentError from './error.js';
import BotError from '@henta/core/error';

function getDiscordArguments(ctx: PlatformContext) {
  return (ctx.raw as any).options['_hoistedOptions']
    .filter(option => option.type !== 11)
    .map(option => option.value.toString());
}

export default function requireArguments(ctx: PlatformContext, params: ArgumentRequest[]) {
  const payloads: unknown[] = [];
  const args = /* ctx.source === 'discord'
    ? getDiscordArguments(ctx)
    : */ctx['commandLine'].substring(ctx['commandName'].length).split(' ');

    // remove whitespace
  if (!args[0]) {
    args.shift();
  }

  for (const param of params) {
    try {
      const parser: ArgumentTypeParser = typeof param.parser === 'function' ? new (param.parser as any)() : param.parser;
      const isTextRequired = parser.isTextRequired ?? true;
      if (isTextRequired && args.length === 0) {
        throw new BotError(`Слишком мало аргументов!!!`);
      }

      const payload = parser.parse(ctx, args, param);
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
        const parser: ArgumentTypeParser = typeof param.parser === 'function' ? new (param.parser as any)() : param.parser;
        return await parser.resolve(ctx, payload)
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