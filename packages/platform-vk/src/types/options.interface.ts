import { type VK } from 'vk-io';
import { type VKOptions } from 'vk-io/lib/types';

export default interface IVKPlatformOptions {
  vk?: (Partial<VKOptions> & { token: string }) | VK;

  /** @deprecated use .vk */
  token: string;

  /** @deprecated use .vk */
  webhookConfirmation?: string;

  /** @deprecated use .vk */
  webhookSecret?: string;

  /** @deprecated use .vk */
  groupId?: number;

  /** @deprecated */
  updatesMode?: 'longpoll';
}
