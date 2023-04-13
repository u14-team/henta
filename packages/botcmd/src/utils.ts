import type { BotcmdContainer, CommandView } from '.';
import { getCommandViewMetadata, getCommands } from './decorators';
import type IBuildedCommand from './types/builded-command.interface';
import type ICommandOptions from './types/command-options.interface';

export function buildCommandsFromView(view: CommandView) {
  const metadata = getCommandViewMetadata(view.constructor);
  const commands = getCommands(view);

  const viewNames = computeNames(metadata);
  return commands.map(
    ({ descriptor, options }): IBuildedCommand => ({
      options: { ...options, ...metadata },
      names: computeNames(options, viewNames),
      handler: descriptor.value.bind(view),
      view,
    }),
  );
}

/** Compute command names with aliases */
export function computeNames(command: ICommandOptions, parentNames?: string[]) {
  const selfNames = [command.name, ...(command.aliases || [])];
  if (parentNames) {
    return parentNames.flatMap((parentName) =>
      selfNames.map((selfName) => `${parentName} ${selfName}`),
    );
  }

  return selfNames;
}

export function findOnContainers(
  commandLine: string,
  containers: BotcmdContainer[],
) {
  const lowerCommandLine = commandLine.toLowerCase();
  for (const container of containers) {
    const found = container.find(lowerCommandLine);
    if (!found) {
      continue;
    }

    return found;
  }

  return null;
}
