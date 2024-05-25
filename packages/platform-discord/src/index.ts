import DiscordPlatform from './discord.platform.js';
import DefaultDiscordUpdateListener from './listeners/default.listener.js';

export interface PlatformDiscordOptions {
  token: string;
  clientId: string;
}

export * from './listeners';

export {
  /** @deprecated */
  DefaultDiscordUpdateListener,
};

export default DiscordPlatform;
