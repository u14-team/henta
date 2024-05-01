import type ISendMessageOptions from '../sendMessageOptions';

export default abstract class ActionsBehaviour {
  public abstract sendMessage(
    options: ISendMessageOptions,
    peerId: string,
  ): Promise<void>;

  public abstract deleteMessage(
    messageId: string,
    peerId: string,
  ): Promise<void>;
}
