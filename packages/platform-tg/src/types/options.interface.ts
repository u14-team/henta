export default interface ITelegramPlatformOptions {
  /** https://t.me/BotFather */
  token: string;

  /** @default longpoll */
  updatesMode?: 'longpoll';
}
