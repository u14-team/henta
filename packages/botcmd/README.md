# @henta/botcmd
Powerful command parser middleware for your bots.
> 📌 Is part of [HENTA Framework](https://github.com/u14-team/henta)

## Usage
1. Create `CommandView` instances and describe their options using decorators.
2. Create a `BotcmdContainer` and add the created commands there.
3. Add `processBotcmd` as middleware for your bot.

> 💡
> 1. **CommandView** - is a class that contains information about commands and subcommands. It can be perceived as a *Controller* from NestJS.
> 2. **BootcmdContainer** - is a container that stores a list of commands. Usually it can be used to separate commands and connect them only under certain conditions (for example, some scenemanager), but in most cases only 1 instance can be used.

```ts
// test.view.ts
import Context from '@app/interfaces/context'; // your context interface extends BotcmdContext

@BotcmdView({ name: 'test' })
export default class TestView extends CommandView {
  @BotcmdCommand()
  public async handler(ctx: Context) {
    await ctx.answer({
      text: 'I\'m fine'
    });
  }
}

// index.ts
const mainCommands: CommandView[] = [
  new TestView()
];

const botcmdContainer = new BotcmdContainer();
botcmdContainer.applyViews(mainCommands);

const hentaBot = initHentaBot(); // your initialization logic
hentaBot.setMiddleware([
  // ...some middlewares before command
  (ctx, next) =>
    processBotcmd(ctx, next, {
      containers: [botcmdContainer],
    }),
  // ...some middlewares after command
]);

await hentaBot.run();
```

You can use a [@henta/input](https://github.com/u14-team/henta/packages/input) to parse input arguments, attachments and custom requests.

```ts
// get-link.view.ts
import Context from '@app/interfaces/context'; // your context interface extends BotcmdContext

@BotcmdView({ name: 'getlink' })
export default class GetLinkView extends CommandView {
  @BotcmdCommand()
  public async handler(
    ctx: Context,
    @AttachmentRequest('photo', (item) => item.getUrl())
    url: string
  ) {
    await ctx.answer({
      text: `Link: ${url}`
    });
  }
}

// index.ts
const botcmdMiddleware = compose([
  (ctx: Context, next) => requestInputArgsMiddleware(ctx, next),
]);

hentaBot.setMiddleware([
  // ...some middlewares before command
  (ctx, next) =>
    processBotcmd(ctx, next, {
      containers: [botcmdContainer],
      middlewares: botcmdMiddleware
    }),
  // ...some middlewares after command
]);
```

## Command metadata
You can define your own command metadata using decorator `@SetMetadata(key, value)`.

Sample:
```ts
import { BotcmdCommand, BotcmdView, CommandView } from '@henta/botcmd';

@SetMetadata('botcmd:custom:hello', 'world')
@BotcmdView({ name: 'тест', aliases: ['test', 'tost'] })
export default class TestView extends CommandView {
  @BotcmdCommand()
  public async handler(ctx) {
    const metadataValue = getCommandMetadata('botcmd:custom:hello', ctx.botcmdData.command);
    await ctx.answer({
      text: `Hello ${metadataValue}`,
    });
  }
}
```
