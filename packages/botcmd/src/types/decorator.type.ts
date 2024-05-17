type Decorator = (
  target: any,
  propertyKey?: string,
  descriptor?: PropertyDescriptor,
) => void;

export default Decorator;
