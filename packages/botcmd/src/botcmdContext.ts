import PlatformContext from '@henta/core/context';
import type IBuildedCommand from './types/builded-command.interface';

export interface BotcmdData {
  command: IBuildedCommand;

  /** Data passed to fn args */
  args?: any[];
}

export default abstract class BotcmdContext extends PlatformContext {
  public botcmdData?: BotcmdData;
}
