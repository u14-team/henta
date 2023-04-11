import type { Readable } from 'stream';

export enum UploadSourceType {
  Url = 'url',
  Stream = 'stream',
  Buffer = 'buffer',
}

export type UploadUrl = Upload<string>;
export type UploadStream = Upload<ReadableStream>;

export default class Upload<T = unknown> {
  public name?: string;

  public constructor(
    public readonly data: T,
    public readonly sourceType: UploadSourceType,
    public readonly type: string,
  ) {}

  public static fromUrl(type: string, url: string) {
    if (typeof url !== 'string' || !url.startsWith('http')) {
      throw new Error('URL is invalid');
    }

    return new Upload<string>(url, UploadSourceType.Url, type) as UploadUrl;
  }

  public static fromStream(type: string, stream: ReadableStream | Readable) {
    return new Upload<ReadableStream>(
      stream as ReadableStream,
      UploadSourceType.Stream,
      type,
    ) as UploadStream;
  }

  public setName(name: string) {
    this.name = name;
    return this;
  }

  public get mime() {
    if (this.type === 'photo') {
      return 'image/jpeg';
    }

    return 'unknown';
    // return mime.getType(this.name);
  }
}
