import Platform from "@henta/core/src/platform/platform";
import ITelegramPlatformOptions from "../types/options.interface";

export default class TelegramPlatform extends Platform {
  public constructor(private readonly options: ITelegramPlatformOptions) {
    super();
  }
}
