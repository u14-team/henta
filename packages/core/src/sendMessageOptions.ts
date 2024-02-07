import type Upload from './files/upload.js';

export default interface ISendMessageOptions {
  text?: string;
  files?: Upload[];
  keyboard?: any; // TODO

  payload?: any;
  isParseLinks?: boolean;
}
