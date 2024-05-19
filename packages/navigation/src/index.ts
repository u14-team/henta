import { KB } from '@henta/core';
import type { PlatformContext, ISendMessageOptions } from '@henta/core';
import type { IKeyboardButton } from '@henta/core';

export interface ISelectorOptions<T = unknown> {
  ctx?: PlatformContext;
  items: T[];
  centerButton?:
    | IKeyboardButton
    | ((item: T) => IKeyboardButton)
    | ((item: T) => Promise<IKeyboardButton>);
  currentIndex: number;
  otherRows?: IKeyboardButton[][];
  handler: (item: T) => Promise<ISendMessageOptions> | ISendMessageOptions;
  help?: () => Promise<ISendMessageOptions> | ISendMessageOptions;
  confirm?: (item: T) => Promise<any>;
  baseCommand: string;
  indexOffset?: number;
  confirmCommand?: string;
}

/** shows one item with the ability to scroll back and forth */
export async function messageWithSelector(
  options: ISelectorOptions,
): Promise<ISendMessageOptions> {
  const indexOffset = options.indexOffset || 0;
  const currentIndex = options.currentIndex + indexOffset;
  const item = options.items[currentIndex];

  if (!item && options.help) {
    return options.help();
  }

  if (options.ctx?.payload?.isConfirmed) {
    return options.confirm(item);
  }

  const response = await options.handler(item);

  const nextIndex =
    currentIndex >= options.items.length - 1 ? 0 : currentIndex + 1;
  const prevIndex =
    currentIndex <= 0 ? options.items.length - 1 : currentIndex - 1;

  return {
    ...response,
    keyboard: [
      [
        KB.text('◀️', `${options.baseCommand} ${prevIndex - indexOffset}`),
        await resolveCenterButton(options, item),
        KB.text('▶️', `${options.baseCommand} ${nextIndex - indexOffset}`),
      ].filter(Boolean),
      ...options.otherRows,
    ],
  };
}

async function resolveCenterButton(options: ISelectorOptions, item) {
  if (!options.centerButton) {
    return {
      label: '✔️',
      payload: {
        text:
          options.confirmCommand ||
          `${options.baseCommand} ${options.currentIndex}`,
        isConfirmed: true,
      },
    };
  }

  if (typeof options.centerButton === 'function') {
    return options.centerButton(item);
  }

  return options.centerButton;
}
