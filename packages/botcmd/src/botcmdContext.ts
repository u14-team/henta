import PlatformContext from '@henta/core/context';
import type { Command } from '.';

export default abstract class BotCmdContext extends PlatformContext {
  commandLine: string;
  commandName: string;
  command: Command;
  commandInput: any; // TODO
}