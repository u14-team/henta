import type { FC, ReactNode } from 'react';
import React from 'react';

interface IKeyboardRowProps {
  children: ReactNode;
}

const KeyboardRow: FC<IKeyboardRowProps> = ({ children }) => {
  return <h-keyboard-row>{children}</h-keyboard-row>;
};

export default KeyboardRow;
