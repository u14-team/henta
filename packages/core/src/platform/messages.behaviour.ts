import type ISendMessageOptions from '../sendMessageOptions';

export default abstract class MessagesBehaviour {
  /**
   * @return messageId
   */
  public abstract send(
    options: ISendMessageOptions,
    peerId: string,
  ): Promise<string>;

  public abstract edit(
    options: ISendMessageOptions,
    messageId: string,
    peerId: string,
  ): Promise<void>;

  public abstract delete(messageId: string, peerId: string): Promise<void>;
}
