import { EventEmitter } from 'node:events';
import type PlatformContext from '../context';

export default abstract class UpdatesBehaviour<
  T = unknown,
> extends EventEmitter {
  public abstract run(): Promise<void>;
  public abstract stop(): Promise<void>;
  public abstract dispatch(rawContext: T): void;

  /* public on(
    eventName: 'message',
    listener: (ctx: PlatformContext) => void,
  ): this; */
}
