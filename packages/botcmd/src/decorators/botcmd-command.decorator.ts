import { COMMAND_METADATA } from '../consts';
import type ICommandOptions from '../types/command-options.interface';
import SetCommandMetadata from './set-command-metadata.decorator';

export default function BotcmdCommand(options: Partial<ICommandOptions> = {}) {
  return SetCommandMetadata(COMMAND_METADATA, options);
}
