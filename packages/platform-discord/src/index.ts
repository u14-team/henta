import type HentaBot from '@henta/core';
import Platform from '@henta/core/platform';
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import DiscordPlatformContext from './context.js';

export interface PlatformDiscordOptions {
  token: string;
  clientId: string;
}

export default class DiscordPlatform extends Platform {
  client: Client;
  options: PlatformDiscordOptions;

  constructor(options: PlatformDiscordOptions) {
    super();

    this.options = options;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds
      ]
    });
  }

  setCallback(callback: (PlatformVkContext) => void, bot: HentaBot) {
    this.client.on('interactionCreate', async interaction => {
      if (!interaction.isChatInputCommand() && !interaction.isButton()) {
        return;
      }
    
      callback(new DiscordPlatformContext(interaction, bot, this));
    });
  }

  async startPooling() {
    await this.client.login(this.options.token);
  }

  async setCommands(commands) {
    // console.log(commands)
    const rest = new REST({ version: '10' }).setToken(this.options.token);
    await rest.put(Routes.applicationCommands(this.options.clientId), { body: commands });
  }
}