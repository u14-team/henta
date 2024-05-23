import VkUpdatesBehaviour from './updates.behaviour';
import PlatformVkContext from '../../context';
import type { MessageContext } from 'vk-io';

export default class LongpollVkUpdatesBehaviour extends VkUpdatesBehaviour {
  public async run() {
    await this.platform.vk.updates.start();

    const dispatch = this.dispatch.bind(this);

    this.platform.vk.updates.on('message_new', dispatch);
    this.platform.vk.updates.on('message_event', dispatch);
  }

  public async stop() {
    await this.platform.vk.updates.stop();
  }

  public dispatch(rawContext: MessageContext) {
    try {
      // If payload data has text field - it was definitely added by button,
      // so we return text to use it as a command.
      if (rawContext.messagePayload?.text) {
        rawContext.text = rawContext.messagePayload.text;
      }

      const context = new PlatformVkContext(rawContext, this.platform);
      this.emit('message', context);
    } catch (error) {
      this.emit('error', error);
    }
  }
}
