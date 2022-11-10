import type PlatformContext from './context.js';
import type HentaBot from './index.js';

export default abstract class Platform {
  slug: string;

  abstract setCallback(callback: (PlatformContext) => void, bot: HentaBot): void;
  abstract startPooling(): Promise<void>;
}