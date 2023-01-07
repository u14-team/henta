import fetch from 'node-fetch';
import Upload, { UploadSourceType, UploadUrl } from "./upload.js";

export function normalizeUploads(rawUploads: any[], supportTypes: UploadSourceType[] = [
  UploadSourceType.Buffer,
  UploadSourceType.Stream,
  UploadSourceType.Url
]): Promise<Upload[]> {
  return Promise.all(rawUploads.map(
    raw => rebuildUpload(raw, supportTypes)
  ));
}

const rebuildTable = {
  url: {
    stream: (from: UploadUrl) => fetch(from.data)
      .then(response => Upload.fromStream(from.type, response.body as ReadableStream)
        .setName(from.name))
  }
};

export async function rebuildUpload(from: Upload, supportTypes: UploadSourceType[]) {
  if (supportTypes.includes(from.sourceType)) {
    return from;
  }

  const method = rebuildTable[from.sourceType]?.[supportTypes[0]];
  if (!method) {
    throw new Error(`Normalizer ${from.sourceType} > ${supportTypes[0]} not found`)
  }

  return method(from);
}