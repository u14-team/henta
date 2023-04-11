// import TgAttachment from './attachment.js';
import TelegramPlatform from './platform/index.js';

export default TelegramPlatform;

/* 
  public async send(
    message: ISendMessageOptions,
    peer: number,
    messageToEdit?,
  ) {
    let files: Upload[];
    if (message.files?.length) {
      files = await normalizeUploads(message.files, [UploadSourceType.Stream]);
    }

    const keyboard = message.keyboard?.map((row) =>
      row.map((v) => getKeyboardButton(v)),
    );

    const body = {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    };

    if (files) {
      const sendAttachment = (file: Upload, body = {}) => {
        const methods = {
          photo: 'sendPhoto',
          audio_message: 'sendVoice',
          document: 'sendDocument',
        };

        const methodName = methods[file.type];
        return this.tg[methodName](
          peer,
          {
            source: file.data,
            filename: file.name,
          },
          body,
        );
      };

      const captionBody = { ...body, caption: message.text };
      // TODO: sendMediaGroup
      const firstAttachment = files.shift();

      const [firstResponse] = await Promise.all([
        sendAttachment(firstAttachment, captionBody),
        ...files.map((file) => sendAttachment(file)),
      ]);

      return firstResponse;
    }

    if (messageToEdit) {
      // console.log('edit', this.sendedAnswer);
      if (messageToEdit.caption !== undefined) {
        return this.tg.telegram.editMessageCaption(
          messageToEdit.chat.id,
          messageToEdit.message_id,
          null,
          message.text,
          body,
        );
      }

      return this.tg.telegram.editMessageText(
        messageToEdit.chat.id,
        messageToEdit.message_id,
        null,
        message.text,
        body,
      );
    }

    return this.tg.telegram.sendMessage(peer, message.text, body);
  }
}*/

// export { TgAttachment };
