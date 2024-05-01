import type { ITextButton, IURLButton } from 'vk-io';

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
      type: 'text',
      label: data.label,
      payload: JSON.stringify(data.payload),
    },
  } as ITextButton;
}
