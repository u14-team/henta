/**
 * You can force your application to run on multiple instances to achieve better performance.
 * A bridge is used for this purpose, it provides an instance for exchanging events between instances.
 */
export default interface HentaBridge {
  connect(): Promise<void>;

  /** start listening for new events from outside */
  fetchUpdates(cb: (data: any) => void): Promise<void>;

  /** send a new event out */
  dispatch(data: any): Promise<void>;
}
