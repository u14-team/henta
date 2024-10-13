import type Upload from '../../files/upload';

export default interface ISendMessageContent {
  text?: string;
  files?: Upload[];
  keyboard?: any; // TODO

  payload?: any;
  isParseLinks?: boolean;
}
