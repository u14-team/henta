import type { ICommandOptions } from '../types';

export default function parseBotcmdDecoratorArgs<T>(args: [T] | string[]) {
  if (typeof args[0] === 'string') {
    const name = args.shift() as string;
    const options = { name } as ICommandOptions;
    if (args.length) {
      options.aliases = args as string[];
    }

    return options;
  }

  return args[0] as T;
}
