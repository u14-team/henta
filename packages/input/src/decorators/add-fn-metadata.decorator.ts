export default function AddFnMetadata<K = string, V = any>(
  metadataKey: K,
  ...values: V[]
) {
  return (target: object, propertyKey?: string, descriptor?) => {
    const metadataTarget = descriptor ? descriptor.value : target;
    const array = Reflect.getMetadata(metadataKey, metadataTarget) || [];
    array.push(...values);

    Reflect.defineMetadata(metadataKey, array, metadataTarget);

    return metadataTarget;
  };
}
