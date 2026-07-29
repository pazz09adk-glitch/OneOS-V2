import React from 'react';
import type { O2FieldProps } from './types';

type Props = O2FieldProps & {
  children: React.ReactNode;
  htmlFor?: string;
};

export function O2Field({
  label,
  required,
  help,
  error,
  className,
  style,
  children,
  htmlFor,
}: Props) {
  const classes = ['o2-field', className].filter(Boolean).join(' ');
  return (
    <div className={classes} style={style} data-invalid={error ? 'true' : undefined}>
      {label ? (
        <label className="o2-field__label" htmlFor={htmlFor}>
          {label}
          {required ? <span className="o2-field__required" aria-hidden>*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="o2-field__error" role="alert">
          {error}
        </p>
      ) : help ? (
        <p className="o2-field__help">{help}</p>
      ) : null}
    </div>
  );
}
