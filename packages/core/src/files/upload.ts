export enum UploadSourceType {
  Url = 'url',
  Stream = 'stream',
  Buffer = 'buffer',
}

export type UploadUrl = Upload<string>;
export type UploadStream = Upload<ReadableStream>;

export default class Upload<T = unknown> {
  name?: string;

   constructor(
    readonly data: T,
    readonly sourceType: UploadSourceType,
    readonly type: string
  ) {}

  static fromUrl(type: string, url: string) {
    if (typeof url !== 'string' || !url.startsWith('http')) {
      throw new Error('URL is invalid');
    }

    return new Upload<string>(url, UploadSourceType.Url, type) as UploadUrl;
  }

  static fromStream(type: string, stream: ReadableStream | ReadableStream) {
    return new Upload<ReadableStream>(stream, UploadSourceType.Stream, type) as UploadStream;
  }

  setName(name: string) {
    this.name = name;
    return this;
  }
}
