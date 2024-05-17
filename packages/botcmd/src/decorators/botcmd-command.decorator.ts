import { COMMAND_METADATA } from '../consts';
import type ICommandOptions from '../types/command-options.interface';
import type Decorator from '../types/decorator.type';
import parseBotcmdDecoratorArgs from '../utils/parse-botcmd-decorator-args';
import SetCommandMetadata from './set-command-metadata.decorator';

function BotcmdCommand(...names: string[]): Decorator;
function BotcmdCommand(options?: Partial<ICommandOptions>): Decorator;
function BotcmdCommand(...args: unknown[]) {
  const options =
    parseBotcmdDecoratorArgs<Partial<ICommandOptions>>(
      args as [Partial<ICommandOptions>] | string[],
    ) || {};

  return SetCommandMetadata(COMMAND_METADATA, options);
}

export default BotcmdCommand;
