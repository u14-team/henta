import type AttachmentsBehaviour from './attachments.behaviour.js';
import type UpdatesBehaviour from './updates.behaviour.js';
import type MessagesBehaviour from './messages.behaviour';

export default abstract class Platform {
  public slug: string;

  /** receiving events about new messages */
  public abstract updatesBehaviour: UpdatesBehaviour;

  /** actions with messages */
  public abstract messagesBehaviour: MessagesBehaviour;

  /** uploading and downloading attachments */
  public attachmentsBehaviour: AttachmentsBehaviour;

  public abstract contextFromSerializedData(rawData: any);

  /* abstract setCallback(callback: (PlatformContext) => void, bot: HentaBot): void;
  abstract startPooling(): Promise<void>;
  abstract getContextFromData(rawData: any, bot: HentaBot);
  abstract getContextData(raw: any);
  abstract send(options: ISendMessageOptions, peer: unknown, messageToEdit?: unknown); */
}
