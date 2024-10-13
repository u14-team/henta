import type { FC, ReactNode } from 'react';
import { Children } from 'react';

interface IListProps {
  children: ReactNode;
  prefix?: ReactNode;
}

const List: FC<IListProps> = ({ children, prefix }) => {
  const childrenWithBreaks = Children.toArray(children).reduce(
    (acc: ReactNode[], child, index, array) => {
      if (prefix) {
        acc.push(prefix);
      }

      acc.push(child);
      if (index < array.length - 1) {
        acc.push('\n');
      }

      return acc;
    },
    [],
  );

  return childrenWithBreaks;
};

export default List;
