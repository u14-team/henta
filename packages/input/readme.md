# @henta/input
Multifunctional input data parser.
> 📌 Is part of [HENTA Framework](https://github.com/u14-team/henta)

## Attachments
Base:
```js
import { AttachmentRequest } from '@henta/input';
import type { Attachment, PlatformContext } from '@henta/core';

async function handler(
    ctx: PlatformContext,
    @ArgumentRequest({ type: 'photo' }) photo: Attachment
) {
    console.log(photo);
    await ctx.answer({ text: 'hello world' });
}

const requests = getAttachmentRequests(command.handler)
    ?.map(v => v.request);
    
console.log(requests);

function myHentaMiddleware(ctx: PlatformContext, next) {
    const args = await requireInputArgs(handler, ctx);
    await command.handler(ctx, ...args);
    return next();
}

// hentaBot: HentaBot
hentaBot.use(myHentaMiddleware);
```

BotCmd command
```js
import { CommandView, BotcmdView, BotcmdCommand } from '@henta/botcmd';
import type { Attachment, PlatformContext } from '@henta/core';
import { AttachmentRequest } from '@henta/input';

@BotcmdView({ name: 'mycommand' })
export default class MyCommandView extends CommandView {
  @BotcmdCommand()
  async handler(
    ctx: Context,
    // You can use converter
    // And also pass only the type to the first argument
    @AttachmentRequest('photo', (item) => item.getUrl()) url: string,
    @AttachmentRequest(AttachmentType.Photo) attachment: Attachment
  ) {
    await ctx.answer({
      text: 'Oh, yes..',
      files: [
        Upload.fromUrl('photo', url),
        Upload.fromUrl('photo', await attachment.getUrl()),
      ],
    });
  }
}
```