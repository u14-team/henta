import AttachmentHistory from "./attachmentHistory.js";
import LocalAttachmentHistoryStorage from './local.storage.js';
import type IAttachmentHistoryStorage from "./storage.interface.js";

export default AttachmentHistory;
export * from "./attachmentHistory.js";
export {
  LocalAttachmentHistoryStorage,
  IAttachmentHistoryStorage,
};