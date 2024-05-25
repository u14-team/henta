import { PlatformListener } from '@henta/core';
import type DiscordPlatform from '..';

export default class DiscordListener extends PlatformListener<DiscordPlatform> {
  public constructor(platform: DiscordPlatform) {
    super(platform);
  }

  public async start() {
    await this.platform.client.login(this.platform.options.token);

    this.platform.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand() && !interaction.isButton()) {
        return;
      }

      this.platform.dispatch(interaction);
    });
  }

  public async stop(): Promise<void> {
    this.platform.client.destroy();
  }
}
