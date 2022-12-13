import type HentaBot from '@henta/core';
import Platform from '@henta/core/platform';
import { MessageContext, VK, SequentialWorker, APIRequest, Upload } from 'vk-io';
import VkAttachment from './attachment.js';
import PlatformVkContext from './context.js';
import { FormDataEncoder } from 'form-data-encoder';
import { PassThrough, Readable } from 'stream';

export interface PlatformVkOptions {
  token: string;
  webhookConfirmation: string;
  webhookSecret: string;
  groupId: number;
}

export default class PlatformVk extends Platform {
  slug = 'vk';
  vk: VK;

  constructor(readonly options: PlatformVkOptions) {
    super();

    this.vk = new VK({
      token: options.token,
      webhookConfirmation: options.webhookConfirmation,
      webhookSecret: options.webhookSecret,
      apiLimit: 20,
      apiRequestMode: 'burst'
    });
  }

  // unstable
  injectVkRequestMake(cb) {
    APIRequest.prototype['make'] = function () {
      const { options } = this.api;
      const params = {
        access_token: options.token,
        v: options.apiVersion,
        ...this.params
      };

      if (options.language !== undefined) {
        params.lang = options.language;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.apiTimeout);
      try {
        return cb(this, Object.entries(params).filter(({ 1: value }) => value !== undefined), controller);
      }
      finally {
        clearTimeout(timeout);
      }
    }
  }

  injectVkUpload(cb) {
    Upload.prototype['upload'] = async function (url, { formData, timeout, forceBuffer }) {
      const { agent, uploadTimeout } = this.options;
      const encoder = new FormDataEncoder(formData);
      const rawBody = Readable.from(encoder.encode());
      const controller = new AbortController();
      const interval = setTimeout(() => controller.abort(), timeout || uploadTimeout);
      const headers = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Connection: 'keep-alive',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ...encoder.headers
      };

      console.time('body')
      const body = forceBuffer
        ? await streamToBuffer(rawBody)
        : rawBody;

        console.timeEnd('body')

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await cb(url, body, headers, controller.signal);
        return result.response !== undefined
          ? result.response
          : result;
      } catch (error) {
        throw error;
      }
      finally {
        clearTimeout(interval);
      }
    };
  }

  setCallback(callback: (PlatformVkContext) => void, bot: HentaBot) {
    this.vk.updates.on('message_new', rawContext => callback(new PlatformVkContext(rawContext, bot, this)));
  }

  getContextFromData(rawData: any, bot: HentaBot) {
    return new PlatformVkContext(
      new MessageContext({
        payload: rawData,
        api: this.vk.api,
        upload: this.vk.upload,
        // type: 'message',
        //subTypes: SubType[];
        // state?: S;
        source: 'WEBSOCKET' as any,
        updateType: 'message_new',
        groupId: this.options.groupId
      }),
      bot,
      this
    );
  }

  async startPooling() {
    await this.vk.updates.start();
  }
}

export { VkAttachment };

const streamToBuffer = async (rawStream) => {
  const stream = new PassThrough();
  rawStream.pipe(stream);
  const chunks = [];
  let totalSize = 0;
  for await (const chunk of stream) {
    totalSize += chunk.length;
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, totalSize);
};