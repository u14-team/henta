import type IKeyboardButton from '../interfaces/keyboard-button.interface';

/** Simple keyboard button creator for most cases */
export default class KB {
  public static text(label: string, text: string): IKeyboardButton {
    return {
      label,
      payload: {
        text,
      },
    };
  }

  public static link(label: string, url: string): any {
    return { label, url };
  }
}
