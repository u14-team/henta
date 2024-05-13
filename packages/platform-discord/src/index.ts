import type HentaBot from '@henta/core';
import { UpdatesBehaviour } from '@henta/core';
import { Platform } from '@henta/core';
import { ChatInputCommandInteraction } from 'discord.js';
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import DiscordPlatformContext from './context.js';
import injectInteractionCreate from './injections/interactionCreate.js';
import DefaultDiscordUpdateListener from './update-listeners/default.update-listener.js';

export interface PlatformDiscordOptions {
  token: string;
  clientId: string;
}

// plug
class DiscordUpdatesBehaviour extends UpdatesBehaviour<unknown> {
  async run(): Promise<void> {}
  async stop(): Promise<void> {}
  async dispatch(rawContext: unknown): void {}
  
}

export default class DiscordPlatform extends Platform {
  messagesBehaviour: HentaBot.MessagesBehaviour;
  slug = 'discord';

  client: Client;
  options: PlatformDiscordOptions;

  /** @deprecated */
  public readonly updatesBehaviour = new DiscordUpdatesBehaviour();

  public constructor(options: PlatformDiscordOptions) {
    super();

    this.options = options;
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds],
    });

    injectInteractionCreate(this.client);
  }

  public dispatch(payload: unknown) {
    const context = new DiscordPlatformContext(
      payload,
      null,
      this,
    );

    this.updatesBehaviour.emit('message', context);
  }

  setCallback(callback: (PlatformVkContext) => void, bot: HentaBot) {
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand() && !interaction.isButton()) {
        return;
      }

      callback(new DiscordPlatformContext(interaction as any, bot, this));
    });
  }

  async setCommands(commands) {
    // console.log(commands)
    const rest = new REST({ version: '10' }).setToken(this.options.token);
    await rest.put(Routes.applicationCommands(this.options.clientId), {
      body: commands,
    });
  }

  public contextFromSerializedData(rawData: any) {
    return this.getContextFromData(rawData, null);
  }

  getContextFromData(rawData: any, bot: HentaBot) {
    const ClassConstructor = ChatInputCommandInteraction as any;
    return new DiscordPlatformContext(
      new ClassConstructor(this.client, rawData),
      bot,
      this,
    );
  }
}

export { DefaultDiscordUpdateListener };
