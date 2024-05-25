import type { ISendMessageOptions, Upload } from '@henta/core';
import { MessagesBehaviour, normalizeUploads } from '@henta/core';
import { getRandomId, type IMessageContextSendOptions } from 'vk-io';
import getKeyboardButton from '../util/keyboard';
import { uploadFile } from '../util/files';
import type VkPlatform from '../vk.platform';

// костыль вытащил из контекста. Нужно откинуть нормально, а не как этот позор.
function normalizeKeyboard(
  rawKeyboard: (object | object[])[],
  buttonsInRow = 4,
  rows = 4,
  max = 20,
) {
  if (!rawKeyboard || !rawKeyboard.find((v) => !Array.isArray(v))) {
    return rawKeyboard;
  }

  const allButtons = rawKeyboard.flat();
  const requiredButtons = allButtons.filter((v: any) => v.isRequired);

  function chunk(array, chunkSize) {
    return new Array(Math.ceil(array.length / chunkSize))
      .fill(0)
      .map((x, i) => array.slice(i * chunkSize, i * chunkSize + chunkSize));
  }

  return chunk(
    [
      ...allButtons
        .filter((v: any) => !v.isRequired)
        .splice(0, buttonsInRow * rows - requiredButtons.length),
      ...requiredButtons,
    ].splice(0, max),
    buttonsInRow,
  );
}

export default class VkMessagesBehaviour extends MessagesBehaviour {
  public constructor(private readonly platform: VkPlatform) {
    super();
  }

  public async send(
    options: ISendMessageOptions,
    peerId: string,
  ): Promise<string> {
    const params = await this.prepareMessageParams(options, peerId);
    const message = await this.platform.vk.api.messages.send({
      ...params,
      random_id: getRandomId(),
      peer_id: peerId as unknown as number,
    });

    return message.toString();
  }

  public async edit(
    options: ISendMessageOptions,
    messageId: string,
    peerId: string,
  ): Promise<void> {
    const params = (await this.prepareMessageParams(options, peerId)) as any;

    await this.platform.vk.api.messages.edit({
      ...params,
      message_id: parseInt(messageId),
      peer_id: params.peer_id,
    });
  }

  public async delete(messageId: string, peerId: string): Promise<void> {
    await this.platform.vk.api.messages.delete({
      peer_id: parseInt(peerId),
      cmids: [parseInt(messageId)],
      delete_for_all: true,
    });
  }

  private async prepareMessageParams(
    options: ISendMessageOptions,
    peerId: string,
  ): Promise<IMessageContextSendOptions> {
    const params: IMessageContextSendOptions = {
      peer_id: parseInt(peerId),
      message: options.text,
      random_id: getRandomId(),
    };

    const attachments = await this.prepareFiles(options.files, peerId);
    if (attachments) {
      params.attachment = attachments;
    }

    if (options.keyboard) {
      const buttons = normalizeKeyboard(options.keyboard, 4, 5, 10).map((row) =>
        row.map((v) => getKeyboardButton(v)),
      );

      params.keyboard = JSON.stringify({
        buttons: buttons,
        inline: true,
      });
    }

    if (options.isParseLinks !== undefined) {
      params.dont_parse_links = !options.isParseLinks;
    }

    return params;
  }

  private async prepareFiles(files?: Upload[], peerId?: string) {
    if (!files?.length) {
      return;
    }

    const normalized = await normalizeUploads(files);
    const attachments = await Promise.all(
      normalized.map((file) =>
        uploadFile(this.platform.vk.upload, file, peerId),
      ),
    );

    console.log(attachments.join(','));
    return attachments.join(',');
  }
}
