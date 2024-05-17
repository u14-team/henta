import { COMMAND_VIEW_METADATA } from '../consts';
import type ICommandOptions from '../types/command-options.interface';
import type Decorator from '../types/decorator.type';
import parseBotcmdDecoratorArgs from '../utils/parse-botcmd-decorator-args';
import SetCommandMetadata from './set-command-metadata.decorator';

function BotcmdView(...names: string[]): Decorator;
function BotcmdView(options: ICommandOptions): Decorator;
function BotcmdView(...args: [ICommandOptions] | string[]) {
  const options = parseBotcmdDecoratorArgs(args);
  return SetCommandMetadata(COMMAND_VIEW_METADATA, options);
}

export default BotcmdView;
