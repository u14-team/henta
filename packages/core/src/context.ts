import type HentaBot from './index.js';

export default abstract class PlatformContext {
  readonly bot: HentaBot;

  source: string;
  raw: unknown;

  text?: string;

  answerBody?: unknown;
  isAnswered: boolean;

  constructor(raw: unknown, bot: HentaBot) {
    this.raw = raw;
    this.bot = bot;
  }

  abstract get originalText (): string | undefined;
  abstract get senderId (): string;

  abstract send(options): Promise<void>;

  answer(options, payload?) {
    if (this.isAnswered) {
      console.warn('Message is answered');
    }

    this.isAnswered = true;
    this.answerBody = options;

    return this.bot.onAnswer(this);
  }
}