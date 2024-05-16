export default function SetCommandMetadata<K = string, V = any>(
  metadataKey: K,
  metadataValue: V,
) {
  return (target: object, propertyKey?: string, descriptor?) => {
    if (descriptor) {
      Reflect.defineMetadata(metadataKey, metadataValue, descriptor.value);
      return descriptor;
    }

    Reflect.defineMetadata(metadataKey, metadataValue, target);
    return target;
  };
}
