export default abstract class PlatformContext {
  source: string;
  abstract raw: unknown;

  text?: string;

  isAnswered: boolean;

  abstract get originalText (): string | undefined;

  abstract send(options): Promise<void>;

  answer(options, payload?) {
    if (this.isAnswered) {
      throw Error('Message is answered');
    }

    this.isAnswered = true;
    return this.send(options);
  }
}