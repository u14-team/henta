enum AttachmentType {
  Photo = 'photo',
  Audio = 'audio',
  Video = 'video',
  AudioMessage = 'audio_message',
}

export type AttachmentTypeString = `${AttachmentType}`;
export type AttachmentTypeUnion = AttachmentType | AttachmentTypeString;
export default AttachmentType;