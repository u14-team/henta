import { Platform } from '@henta/core';
import { APIRequest, MessageContext, Upload, VK } from 'vk-io';
import { FormDataEncoder } from 'form-data-encoder';
import { PassThrough, Readable } from 'stream';
import type IVKPlatformOptions from '../types/options.interface';
import type VkUpdatesBehaviour from './updates/updates.behaviour';
import LongpollVkUpdatesBehaviour from './updates/longpoll-updates.behaviour';
import PlatformVkContext from '../context';
import VKActionsBehaviour from './actions.behaviour';

export default class VkPlatform extends Platform {
  public readonly slug = 'vk';
  public readonly vk: VK;
  public readonly updatesBehaviour: VkUpdatesBehaviour;
  public readonly actionsBehaviour: VKActionsBehaviour;

  public constructor(private readonly options: IVKPlatformOptions) {
    super();

    this.normalizeOptions();

    this.vk = new VK({
      token: options.token,
      webhookConfirmation: options.webhookConfirmation,
      webhookSecret: options.webhookSecret,
      apiLimit: 20,
      apiRequestMode: 'burst',
    });

    this.updatesBehaviour = this.createUpdatesBehaviour();
    this.actionsBehaviour = new VKActionsBehaviour(this.vk);
  }

  public contextFromSerializedData(rawData: any) {
    return new PlatformVkContext(
      new MessageContext({
        payload: rawData,
        api: this.vk.api,
        upload: this.vk.upload,
        source: 'WEBSOCKET' as any,
        updateType: 'message_new',
        groupId: this.options.groupId,
      }),
      this,
    );
  }

  private normalizeOptions() {
    if (!this.options.token) {
      throw new Error('vk.io token is required');
    }

    this.options.updatesMode = this.options.updatesMode || 'longpoll';
  }

  private createUpdatesBehaviour() {
    switch (this.options.updatesMode) {
      case 'longpoll':
        return new LongpollVkUpdatesBehaviour(this);
      default:
        throw new Error(
          `Updates mode ${this.options.updatesMode} is not supported`,
        );
    }
  }

  // unstable
  public injectVkRequestMake(cb) {
    APIRequest.prototype['make'] = function () {
      const { options } = this.api;
      const params = {
        access_token: options.token,
        v: options.apiVersion,
        ...this.params,
      };

      if (options.language !== undefined) {
        params.lang = options.language;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.apiTimeout);
      try {
        return cb(
          this,
          Object.entries(params).filter(({ 1: value }) => value !== undefined),
          controller,
        );
      } finally {
        clearTimeout(timeout);
      }
    };
  }

  public injectVkUpload(cb) {
    Upload.prototype['upload'] = async function (
      url,
      { formData, timeout, forceBuffer },
    ) {
      const { agent, uploadTimeout } = this.options;
      const encoder = new FormDataEncoder(formData);
      const rawBody = Readable.from(encoder.encode());
      const controller = new AbortController();
      const interval = setTimeout(
        () => controller.abort(),
        timeout || uploadTimeout,
      );
      const headers = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Connection: 'keep-alive',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ...encoder.headers,
      };

      console.time('body');
      const body = forceBuffer ? await streamToBuffer(rawBody) : rawBody;

      console.timeEnd('body');

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await cb(url, body, headers, controller.signal);
        return result.response !== undefined ? result.response : result;
      } catch (error) {
        throw error;
      } finally {
        clearTimeout(interval);
      }
    };
  }
}

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
