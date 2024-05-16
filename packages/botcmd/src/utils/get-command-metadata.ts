import type { IBuildedCommand } from '../types';

export default function getCommandMetadata<K = any, T = any>(
  key: K,
  command: IBuildedCommand,
): T {
  const commandMetadata = Reflect.getMetadata(key, command.value);
  if (commandMetadata) {
    return commandMetadata;
  }

  return Reflect.getMetadata(key, command.view.constructor);
}
