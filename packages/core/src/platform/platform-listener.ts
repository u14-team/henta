import type Platform from './platform';

/** The listener is used to receive events from the platforms and send them to the platform instance.
 * One platform can receive events in several ways.
 */
export default abstract class PlatformListener<T = Platform> {
  public constructor(public readonly platform: T) {}

  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;
}
