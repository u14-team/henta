export default function getKeyboardButton(data) {
  return {
    action: {
      type: 'text',
      label: data.label,
      payload: JSON.stringify(data.payload)
    }
  };
}