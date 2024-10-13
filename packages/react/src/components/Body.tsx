import type { FC, ReactNode } from 'react';
import React from 'react';

const Body: FC<{ children: ReactNode }> = ({ children }) => {
  return <h-body>{children}</h-body>;
};

export default Body;
