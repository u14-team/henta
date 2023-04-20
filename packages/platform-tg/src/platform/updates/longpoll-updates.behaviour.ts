import type Context from 'telegraf/typings/context';
import TelegramUpdatesBehaviour from './updates.behaviour';
import type { Update } from 'telegraf/typings/core/types/typegram';
import PlatformTgContext from '../../context';

export default class LongpollTelegramUpdatesBehaviour extends TelegramUpdatesBehaviour {
  public async run() {
    this.platform.tg.launch();

    const dispatch = this.dispatch.bind(this);
    this.platform.tg.on('message', dispatch);
    this.platform.tg.on('callback_query', dispatch);
  }

  public async stop() {
    this.platform.tg.stop();
  }

  public dispatch(rawContext: Context<Update>) {
    try {
      const context = new PlatformTgContext(rawContext, this.platform);
      this.emit('message', context);
    } catch (error) {
      this.emit('error', error);
    }
  }
}
