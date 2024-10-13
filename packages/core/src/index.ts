import AttachmentType, {
  AttachmentTypeString,
  AttachmentTypeUnion,
} from './attachment-type.enum.js';
import Attachment from './attachment.js';
import PlatformContext from './context.js';
import BotError from './error.js';
import Upload, { UploadSourceType } from './files/upload.js';
import { normalizeUploads } from './files/uploadNormalizer.js';
import IKeyboardButton from './interfaces/keyboard-button.interface.js';
import MessagesBehaviour from './platform/messages.behaviour.js';
import AttachmentsBehaviour from './platform/attachments.behaviour.js';
import Platform from './platform/platform.js';
import UpdatesBehaviour from './platform/updates.behaviour.js';
import type ISendMessageOptions from './sendMessageOptions.js';
import KB from './util/kb.js';

export * from './util/reflector.js';
export * from './platform';
export * from './types';

export {
  Attachment,
  ISendMessageOptions,
  KB,
  normalizeUploads,
  UploadSourceType,
  Upload,
  PlatformContext,
  Platform,
  AttachmentsBehaviour,
  UpdatesBehaviour,
  MessagesBehaviour,
  BotError,
  AttachmentType,
  AttachmentTypeUnion,
  AttachmentTypeString,
  IKeyboardButton,
  PlatformContext as Context,
};
