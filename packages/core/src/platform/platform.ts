import AttachmentsBehaviour from './attachments.behaviour.js';
import UpdatesBehaviour from './updates.behaviour.js';
import ActionsBehaviour from './actions.behaviour.js';

export default abstract class Platform {
  public slug: string;

  /** receiving events about new messages */
  public updatesBehaviour: UpdatesBehaviour;

  /** sending a message and other common actions */
  public actionsBehaviour: ActionsBehaviour;

  /** uploading and downloading attachments */
  public attachmentsBehaviour: AttachmentsBehaviour;

  /* abstract setCallback(callback: (PlatformContext) => void, bot: HentaBot): void;
  abstract startPooling(): Promise<void>;
  abstract getContextFromData(rawData: any, bot: HentaBot);
  abstract getContextData(raw: any);
  abstract send(options: ISendMessageOptions, peer: unknown, messageToEdit?: unknown); */
}