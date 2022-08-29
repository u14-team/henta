export default class BotError extends Error {
  get messageData() {
    return {
      text: this.message
    };
  }
}