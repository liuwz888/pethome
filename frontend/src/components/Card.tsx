import React from 'react';
import classNames from 'classnames';

interface CardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'transparent';
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  imageUrl,
  children,
  className,
  variant = 'primary',
  icon,
  size = 'md',
  ...props
}) => {
  const baseClasses = 'card';
  const variantClasses = {
    primary: 'card-primary',
    secondary: 'card-secondary',
    transparent: 'card-transparent'
  };

  const sizeClasses = {
    sm: 'card-sm',
    md: 'card-md',
    lg: 'card-lg'
  };

  const classes = classNames(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <div className={classes}>
      {(imageUrl || icon) && (
        <div className='card-image'>
          {imageUrl && <img src={imageUrl} alt={title} />}
          {!imageUrl && icon && <div className='card-icon'>{icon}</div>}
        </div>
      )}
      <div className='card-content'>
        {icon && !imageUrl && <div className='card-icon-header'>{icon}</div>}
        <h3>{title}</h3>
        {subtitle && <p className='card-subtitle'>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};
