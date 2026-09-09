import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'quiet';
type ButtonShape = 'rounded' | 'pill' | 'icon';
type ButtonSize = 'large' | 'small';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  shape?: ButtonShape;
  size?: ButtonSize;
  leading?: ReactNode;
};

export function ActionButton({ variant = 'primary', shape = 'rounded', size = 'large', leading, className = '', children, type = 'button', ...props }: Props) {
  return <button type={type} className={`ui-button ui-button--${variant} ui-button--${shape} ui-button--${size} ${className}`.trim()} {...props}>{leading}{children}</button>;
}
