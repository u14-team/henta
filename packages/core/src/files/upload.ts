import type { Stream } from "node:stream";

export enum UploadSourceType {
  Url = 'url',
  Stream = 'stream',
  Buffer = 'buffer',
}

export type UploadUrl = Upload<string>;
export type UploadStream = Upload<Stream>;

export default class Upload<T = unknown> {
  name?: string;

   constructor(
    readonly data: T,
    readonly sourceType: UploadSourceType,
    readonly type: string
  ) {}

  static fromUrl(type: string, url: string) {
    return new Upload<string>(url, UploadSourceType.Url, type) as UploadUrl;
  }

  static fromStream(type: string, stream: Stream) {
    return new Upload<Stream>(stream, UploadSourceType.Stream, type) as UploadStream;
  }

  setName(name: string) {
    this.name = name;
    return this;
  }
}
