import BotError from './error.js';
import type HentaBot from './index.js';
import type Attachment from './attachment.js';
import type Platform from './platform.js';
import type ISendMessageOptions from './sendMessageOptions.js';

export default abstract class PlatformContext {
  readonly bot: HentaBot;

  source: string;
  raw: unknown;
  platform: Platform;

  text?: string;

  sendedAnswer?: any;
  answerBody?: unknown;
  isAnswered: boolean;

  constructor(raw: unknown, bot: HentaBot, platform: Platform) {
    this.raw = raw;
    this.bot = bot;
    this.platform = platform;
  }

  abstract get originalText (): string | undefined;
  abstract get senderId (): string;
  abstract get peerId (): string;
  abstract get isChat (): boolean;
  abstract get payload (): any;

  abstract get attachments (): Attachment[];
  abstract get nestedAttachments (): Attachment[];

  abstract send(options: ISendMessageOptions, isAnswer?: boolean): Promise<unknown>;

  async answer(options: ISendMessageOptions, payload?) {
    this.isAnswered = true;
    this.answerBody = options;

    this.sendedAnswer = await this.bot.onAnswer(this);
    return this.sendedAnswer;
  }

  normalizeKeyboard(rawKeyboard: (object | object[])[], buttonsInRow = 4, rows = 4, max = 20) {
    if (!rawKeyboard || !rawKeyboard.find(v => !Array.isArray(v))) {
      return rawKeyboard;
    }

    const allButtons = rawKeyboard.flat();
    const requiredButtons = allButtons.filter((v: any) => v.isRequired);

    function chunk(array, chunkSize) {
      return new Array(Math.ceil(array.length / chunkSize)).fill(0)
        .map((x, i) => array.slice(i * chunkSize, i * chunkSize + chunkSize));
    }

    return chunk([
      ...allButtons.filter((v: any) => !v.isRequired).splice(0, buttonsInRow * rows - requiredButtons.length),
      ...requiredButtons
    ].splice(0, max), buttonsInRow);
  }

  loadAttachments(attachments: any[]) {
    // TODO: attachment loader
    return attachments.map(
      attachment => ({
        type: attachment.type,
        data: attachment.source
      })
    );
  }

  requireAttachments(attachments: any[], fallback = []) {
    if (attachments.length === 0) {
      return [];
    }

    const allAttachments: Attachment[] = [
      ...this.attachments,
      ...this.nestedAttachments,
      ...fallback
    ];

    const foundList = [];
    attachments.forEach(attachment => {
      const foundIndex = allAttachments.findIndex(v => v.type === attachment.type);
      if (foundIndex === -1) {
        // TODO: нужно вынести requireAttachments в отдельный пакет как и attachment requirer. Также сделать условный MediaNotFoundBotError для поддержки кастом ошибок. А то, что здесь: временное решение.
        const words = {
          'photo': 'изображением',
          'audio_message': 'ГС'
        };

        throw new BotError(`🖼 Используйте эту команду вместе с ${words[attachment.type]}.\nМожно переслать мне сообщение с ${words[attachment.type]} или прикрепить его.`);
      }

      const [found] = allAttachments.splice(foundIndex, 1);
      let value: any = found;
      if (attachment.to === 'url') {
        value = () => found.getUrl();
      }

      foundList.push(typeof value === 'function' ? value : () => value);
    });

    return Promise.all(foundList.map(v => v()));
  }
}