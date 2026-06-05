import React from 'react';
import classNames from 'classnames';

interface FormInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className,
}) => {
  const inputId = `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`form-group ${className || ''}`}>
      <label htmlFor={inputId}>
        {label}
        {required && <span className='required'>*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={classNames('form-input', {
          'error': error,
        })}
      />
      {error && <span className='error-message'>{error}</span>}
    </div>
  );
};
