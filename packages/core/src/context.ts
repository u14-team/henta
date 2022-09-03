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
  abstract get payload (): unknown;

  abstract send(options): Promise<void>;

  answer(options, payload?) {
    if (this.isAnswered) {
      console.warn('Message is answered');
    }

    this.isAnswered = true;
    this.answerBody = options;

    return this.bot.onAnswer(this);
  }

  normalizeKeyboard(rawKeyboard: (object | object[])[], buttonsInRow = 4, rows = 4) {
    if (!rawKeyboard || !rawKeyboard.find(v => !Array.isArray(v))) {
      return rawKeyboard;
    }

    const allButtons = rawKeyboard.flat();
    const requiredButtons = allButtons.filter(v => v.isRequired);

    function chunk(array, chunkSize) {
      return new Array(Math.ceil(array.length / chunkSize)).fill(0)
        .map((x, i) => array.slice(i * chunkSize, i * chunkSize + chunkSize));
    }

    return chunk([
      ...allButtons.filter(v => !v.isRequired).splice(0, buttonsInRow * rows - requiredButtons.length),
      ...requiredButtons
    ], buttonsInRow);
  }
}