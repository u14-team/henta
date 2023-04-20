# @henta/mentions
bot's reaction to requests
> 📌 Is part of [HENTA Framework](https://github.com/u14-team/henta)

```ts
const botMentionsMiddleware = (ctx, next) => mentionsMiddleware(ctx, next, {
  mention: /\/|mybot|botik/,
  // optional
  noMentionCallback: (ctx, next, reason) => {
    console.log('no mention callback', reason);
  }
})
```