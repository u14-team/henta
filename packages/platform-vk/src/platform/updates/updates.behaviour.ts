import { UpdatesBehaviour } from '@henta/core';
import type VkPlatform from '..';

export default abstract class VkUpdatesBehaviour extends UpdatesBehaviour {
  public constructor(protected readonly platform: VkPlatform) {
    super();
  }
}
