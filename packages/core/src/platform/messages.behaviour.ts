import type ISendMessageOptions from '../sendMessageOptions';

export default abstract class MessagesBehaviour {
  public abstract sendMessage(
    options: ISendMessageOptions,
    peerId: string,
  ): Promise<void>;

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
