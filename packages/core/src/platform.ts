import type PlatformContext from './context.js';

export default abstract class Platform {
  abstract setCallback(callback: (PlatformContext) => void): void;
  abstract startPooling(): Promise<void>;
}