export default function getKeyboardButton(data) {
  if (data.url) {
    return {
      text: data.label,
      url: data.url
    };
  }

  return {
    text: data.label,
    callback_data: JSON.stringify(data.payload)
  };
}