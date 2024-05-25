import type { MessagesBehaviour } from '@henta/core';
import { Platform } from '@henta/core';
import {
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  REST,
} from 'discord.js';
import type { PlatformDiscordOptions } from '.';
import injectInteractionCreate from './injections/interactionCreate';
import DiscordPlatformContext from './context';

export default class DiscordPlatform extends Platform {
  public readonly slug = 'discord';

  public readonly messagesBehaviour: MessagesBehaviour;
  public readonly client: Client;
  public readonly rest: REST;

  public constructor(private readonly options: PlatformDiscordOptions) {
    super();

    this.options = options;
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds],
    });

    this.rest = new REST({ version: '10' }).setToken(this.options.token);

    injectInteractionCreate(this.client);
  }

  public dispatch(payload: unknown) {
    const context = new DiscordPlatformContext(payload as any, null, this);
    this.emit('message', context);
  }

  public contextFromSerializedData(rawData: any) {
    const ClassConstructor = ChatInputCommandInteraction as any;
    return new DiscordPlatformContext(
      new ClassConstructor(this.client, rawData),
      null,
      this,
    );
  }
}
