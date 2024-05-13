import type DiscordPlatform from '..';

export default class DefaultDiscordUpdateListener {
  public constructor(private readonly platform: DiscordPlatform) {}

  public async start() {
    await this.platform.client.login(this.platform.options.token);

    this.platform.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand() && !interaction.isButton()) {
        return;
      }

      this.platform.dispatch(interaction);
    });
  }
}
