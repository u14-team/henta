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
    const preparedCommand = commandLine.split(' ');

    let maxMatches = -1;
    let closestArray: string[] = null;
    let closestCommand: ReturnType<BotcmdContainer['find']> = null;

    for (const [key, command] of this.commandByName) {
      const preparedKey = key.split(' ');
      // Without set, sub-commands containing a similar string to parent command will always override.
      // This solution causes a bug, but it's a better way.
      const inclusion = new Set(
        preparedKey.filter((item) => preparedCommand.includes(item)),
      );

      const matches = inclusion.size;
      if (!matches) {
        continue;
      }

      if (
        matches > maxMatches ||
        // Prefer more basic commands.
        (matches === maxMatches && closestArray?.length > preparedKey.length)
      ) {
        maxMatches = matches;
        closestArray = preparedKey;
        closestCommand = { pattern: key, command };
      }
    }

    return closestCommand;
  }
}
