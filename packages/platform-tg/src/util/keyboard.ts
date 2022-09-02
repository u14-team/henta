export default function getKeyboardButton(data) {
  return {
    text: data.label,
    callback_data: JSON.stringify(data.payload)
  };
}