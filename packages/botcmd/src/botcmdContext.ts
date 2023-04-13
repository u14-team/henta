import PlatformContext from '@henta/core/context';
import type { Command } from '.';

export interface BotcmdData {
  command: Command;

  /** Data passed to fn args */
  args?: any[];
}

export default abstract class BotcmdContext extends PlatformContext {
  public botcmdData?: BotcmdData;
}
