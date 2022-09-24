export default abstract class Attachment {
  type: string;
  source: string;
  payload: any;
  platform: any;

  constructor(type: string, payload: any, platform: any) {
    this.type = type;
    this.payload = payload;
    this.platform = platform;
  }

  abstract getUrl(): Promise<string> | string;
}