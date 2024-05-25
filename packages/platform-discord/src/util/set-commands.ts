import { Routes } from 'discord.js';
import type DiscordPlatform from '../discord.platform';

// TODO: typings
export default async function setCommands(
  platform: DiscordPlatform,
  commands: unknown[],
) {
  const route = Routes.applicationCommands(this.options.clientId);
  await platform.rest.put(route, {
    body: commands,
  });
}
