import type { FC, ReactNode } from 'react';
import React from 'react';

interface IKeyboardProps {
  children: ReactNode;

  /** @default inline */
  mode?: 'inline' | 'standalone';
}

const Keyboard: FC<IKeyboardProps> = ({ children, mode = 'inline' }) => {
  return <h-keyboard mode={mode}>{children}</h-keyboard>;
};

export default Keyboard;
