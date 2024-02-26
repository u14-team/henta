export default interface IVKPlatformOptions {
  token: string;
  webhookConfirmation: string;
  webhookSecret: string;
  groupId: number;

  /** @default longpoll */
  updatesMode?: 'longpoll';
}
