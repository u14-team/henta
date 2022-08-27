# HENTA
Фреймворк для создания полностью программируемых чат-ботов любой сложности.

```
import VkPlatform from '@henta/platform-vk';
import TgPlatform from '@henta/platform-tg';

import HentaBot from '@henta/core';

const hentaBot = new HentaBot();
const vkPlatform = new VkPlatform({ token: process.env.VK_TOKEN });
const tgPlatform = new TgPlatform({ token: process.env.TG_TOKEN });

// subscribe to platforms
hentaBot.subscribe(vkPlatform);
hentaBot.subscribe(tgPlatform);

hentaBot.use((ctx, next) => {
  ctx.answer({ text: 'Хей!' });
  return next();
});

export default async function initBot() {
  await Promise.all([
    vkPlatform.startPooling(),
    tgPlatform.startPooling()
  ]);

  console.log('Bot initialized successfully.');
}

initBot();
```