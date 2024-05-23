import type { ICallbackButton, ITextButton, IURLButton } from 'vk-io';

export default function getKeyboardButton(data) {
  if (data.url) {
    return {
      action: {
        type: 'open_link',
        label: data.label,
        link: data.url,
      },
    } as IURLButton;
  }

  return {
    action: {
      type: 'callback',
      label: data.label,
      payload: JSON.stringify(data.payload),
    },
  } as ICallbackButton;
}
