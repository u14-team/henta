import { COMMAND_VIEW_METADATA } from '../consts';
import type ICommandOptions from '../types/command-options.interface';
import SetCommandMetadata from './set-command-metadata.decorator';

export default function BotcmdView(options: ICommandOptions) {
  return SetCommandMetadata(COMMAND_VIEW_METADATA, options);
}
