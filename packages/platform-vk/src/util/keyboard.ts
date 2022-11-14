export default function getKeyboardButton(data) {
  const action: any = { label: data.label };

  if (data.url) {
    Object.assign(action, { type: 'open_link', link: data.url });
    return { action };
  }

  Object.assign(action, { type: 'text', payload: JSON.stringify(data.payload) });
  return { action };
}