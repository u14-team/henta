import type { IKeyboardButton } from '@henta/core';
import type { FC, ReactNode } from 'react';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IButtonProps extends Omit<IKeyboardButton, 'label'> {
  children: ReactNode;
}

const Button: FC<IButtonProps> = ({ children, ...props }) => {
  return <h-keyboard-button {...props}>{children}</h-keyboard-button>;
};

export default Button;
