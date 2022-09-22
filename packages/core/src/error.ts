export default class BotError extends Error {
  options: any;

  constructor(message: string | any) {
    const options = typeof message === 'string' ? { text: message } : message;
    super(options.text);
    this.options = options;
  }

  get messageData() {
    return this.options;
  }
}