import type { CommandView } from '.';
import type IBuildedCommand from './types/builded-command.interface';
import { buildCommandsFromView } from './utils';

export default class BotcmdContainer {
  public readonly commands: IBuildedCommand[] = [];
  private commandByName = new Map<string, IBuildedCommand>();

  public applyViews(views: CommandView[]) {
    for (const view of views) {
      const commands = buildCommandsFromView(view);
      this.commands.push(...commands);
      commands.forEach((command) => {
        command.names.map((name) => this.commandByName.set(name, command));
      });
    }

    this.commandByName = new Map(
      [...this.commandByName].sort(([a], [b]) => b.length - a.length),
    );
  }

  public find(
    commandLine: string,
  ): { pattern: string; command: IBuildedCommand } | null {
    // maybe faster?
    for (const [key, value] of this.commandByName) {
      if (key === commandLine || commandLine.startsWith(`${key} `)) {
        return { pattern: key, command: value };
      }
    }

    return null;
  }
}
