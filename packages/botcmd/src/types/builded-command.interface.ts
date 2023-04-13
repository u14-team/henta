import type { PlatformContext } from '@henta/core';
import type ICommandOptions from './command-options.interface';
import type { CommandView } from '..';

export default interface IBuildedCommand {
  options: ICommandOptions;
  names: string[];
  handler: (ctx: PlatformContext, ...args) => Promise<void>;
  view: CommandView;
}
