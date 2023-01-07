import PlatformContext from '@henta/core/context';
import type { Command } from '.';
import BotCmd from '.';

export interface BotCmdData {
  botcmd: BotCmd;
  commandLine: string;
  command: Command;

  /** Data passed to fn args */
  args?: any[];
}

export default abstract class BotCmdContext extends PlatformContext {
  botcmdData?: BotCmdData;
}
