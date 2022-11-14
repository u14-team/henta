import type { ISendMessageOptions } from "@henta/core";
import type DiscordPlatformContext from "../context";

export function getKeyboardData(ctx: DiscordPlatformContext, options: ISendMessageOptions) {
  if (!options.keyboard) {
    return [];
  }

  const rows = ctx.normalizeKeyboard(options.keyboard);
  return rows.map(row => ({
        type: 1,
        components: row.map(button => getKeyboardButton(button))
      }));
}

function getKeyboardButton(button) {
  if (button.url) {
    return {
      url: button.url,
      type: 2,
      style: 5,
      label: button.label,
    }
  }

  return {
    custom_id: JSON.stringify(button.payload),
    type: 2,
    style: 1,
    label: button.label,
  };
}
