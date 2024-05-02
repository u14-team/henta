import type ISendMessageOptions from '../sendMessageOptions';

export default abstract class MessagesBehaviour {
  /**
   * @return messageId
   */
  public abstract sendMessage(
    options: ISendMessageOptions,
    peerId: string,
  ): Promise<string>;

  public abstract editMessage(
    options: ISendMessageOptions,
    messageId: string,
    peerId: string,
  ): Promise<void>;

  public abstract deleteMessage(
    messageId: string,
    peerId: string,
  ): Promise<void>;
}
