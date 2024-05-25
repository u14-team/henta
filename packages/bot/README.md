# @henta/bot
A convenient and flexible class for creating bots on henta
> 📌 Is part of [HENTA Framework](https://github.com/u14-team/henta)

## Usage
```ts
const bot = new HentaBot(process.env.MODE as BotMode);

// you can add any platforms that are convenient for you
const telegramPlatform = new TelegramPlatform({ token: process.env.TG_TOKEN });
bot.platforms.add(telegramPlatform);

const longpollTelegramListener = new LongpollTelegramListener(telegramPlatform);
bot.listeners.add(longpollTelegramListener);

/*
these middlewares will be processed when your bot receives a message. With their help, you can, for example, request a user from a database, catch and process errors, or check whether you need to respond to this message.

Order matters.
*/
bot.setMiddleware([
  async (ctx, next) => {
    if (ctx.text === 'hello') {
      await ctx.answer({ text: 'hello world' });
    }

    return next();
  },
  async (ctx, next) => {
    if (ctx.isAnswered) {
      return next();
    }

    await ctx.answer({ text: 'maybe "hello"?' });
    return next();
  }
]);

/*
Here you can catch errors when sending a message or additionally process it for some effects or notes about changes (balance changes, new items in the inventory, etc.).
*/
bot.setAnswerMiddleware([]);
await bot.start();


```
