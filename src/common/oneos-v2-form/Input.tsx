import React, { forwardRef, useId } from 'react';
import { O2Field } from './Field';
import type { O2FieldProps } from './types';

export type O2InputProps = O2FieldProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'className' | 'style'> & {
    tabularNums?: boolean;
    inputClassName?: string;
  };

export const O2Input = forwardRef<HTMLInputElement, O2InputProps>(function O2Input(
  {
    label,
    required,
    help,
    error,
    className,
    style,
    size = 'md',
    disabled,
    id,
    tabularNums,
    inputClassName,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id || autoId;
  const controlClass = [
    'o2-control',
    `o2-control--${size}`,
    error ? 'o2-control--error' : '',
    tabularNums ? 'o2-control--tabular' : '',
    inputClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <O2Field
      label={label}
      required={required}
      help={help}
      error={error}
      className={className}
      style={style}
      htmlFor={inputId}
    >
      <div className={controlClass}>
        <input
          ref={ref}
          id={inputId}
          className="o2-control__input"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          {...rest}
        />
      </div>
    </O2Field>
  );
});
