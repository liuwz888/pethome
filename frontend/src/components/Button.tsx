import React from 'react';
import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost'
  };
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  };

  const classes = classNames(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <button className={classes} {...props}>
      {icon && iconPosition === 'left' && <span className='btn-icon'>{icon}</span>}
      <span className='btn-content'>{children}</span>
      {icon && iconPosition === 'right' && <span className='btn-icon'>{icon}</span>}
    </button>
  );
};
