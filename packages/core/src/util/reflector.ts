/* eslint-disable @typescript-eslint/ban-types */
export function applyDecorators(
  ...decorators: unknown[]
): Function {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ): void => {
    decorators.forEach((decorator) => {
      if (propertyKey !== undefined && descriptor !== undefined) {
        // It's a method or accessor decorator
        decorator(target, propertyKey, descriptor);
      } else {
        // It's a class decorator
        (decorator as ClassDecorator)(target);
      }
    });
  };
}
