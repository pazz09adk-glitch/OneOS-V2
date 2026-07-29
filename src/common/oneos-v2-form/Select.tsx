import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, X } from 'lucide-react';
import { O2Field } from './Field';
import { useDismissOnFocusOutside } from './hooks/useDismissOnFocusOutside';
import type { O2FieldProps, O2SelectOption } from './types';

export type O2SelectProps = O2FieldProps & {
  value: string;
  options: O2SelectOption[] | string[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  allowClear?: boolean;
  ariaLabel?: string;
};

function normalizeOptions(options: O2SelectOption[] | string[]): O2SelectOption[] {
  return options.map((item) =>
    typeof item === 'string' ? { value: item, label: item } : item,
  );
}

export function O2Select({
  label,
  required,
  help,
  error,
  className,
  style,
  size = 'md',
  disabled,
  id,
  value,
  options,
  onChange,
  placeholder = '请选择',
  searchable = true,
  allowClear = true,
  ariaLabel,
}: O2SelectProps) {
  const autoId = useId();
  const fieldId = id || autoId;
  const opts = useMemo(() => normalizeOptions(options), [options]);
  const selected = opts.find((o) => o.value === value);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const anchorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dismiss = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  useDismissOnFocusOutside(open, [anchorRef, popoverRef], dismiss);

  const updatePos = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open, updatePos, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchable) return opts;
    return opts.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [opts, query, searchable]);

  const openPicker = () => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    window.requestAnimationFrame(() => {
      updatePos();
      if (searchable) inputRef.current?.focus();
    });
  };

  const pick = (next: string) => {
    onChange(next);
    dismiss();
  };

  const clear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onChange('');
    dismiss();
  };

  const display = open && searchable ? query : selected?.label || '';
  const controlClass = [
    'o2-control',
    'o2-control--picker',
    `o2-control--${size}`,
    open ? 'is-open' : '',
    error ? 'o2-control--error' : '',
    disabled ? 'is-disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const popover =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={popoverRef}
            className="o2-popover o2-popover--portal"
            role="listbox"
            aria-label={ariaLabel || (typeof label === 'string' ? label : '选择')}
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <div className="o2-popover__list">
              {filtered.length === 0 ? (
                <p className="o2-popover__empty">暂无匹配项</p>
              ) : (
                filtered.map((item) => {
                  const checked = item.value === value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      role="option"
                      aria-selected={checked}
                      disabled={item.disabled}
                      className={`o2-popover__option ${checked ? 'is-checked' : ''}`}
                      onClick={() => !item.disabled && pick(item.value)}
                    >
                      <span className="o2-popover__option-label">{item.label}</span>
                      {checked ? <Check size={14} aria-hidden /> : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <O2Field
      label={label}
      required={required}
      help={help}
      error={error}
      className={className}
      style={style}
      htmlFor={fieldId}
    >
      <div className="o2-picker" ref={anchorRef}>
        <div className={controlClass} onClick={openPicker}>
          <input
            ref={inputRef}
            id={fieldId}
            type="text"
            className="o2-control__input"
            value={display}
            placeholder={placeholder}
            readOnly={!searchable || !open}
            disabled={disabled}
            aria-expanded={open}
            aria-invalid={error ? true : undefined}
            aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
            onChange={(e) => {
              if (!searchable) return;
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={openPicker}
            onKeyDown={(e) => {
              if (e.key === 'Escape') dismiss();
              if (e.key === 'Enter' || e.key === ' ') {
                if (!open) {
                  e.preventDefault();
                  openPicker();
                }
              }
            }}
          />
          {allowClear && value && !disabled ? (
            <button
              type="button"
              className="o2-control__icon-btn"
              aria-label="清空"
              tabIndex={-1}
              onClick={clear}
            >
              <X size={14} aria-hidden />
            </button>
          ) : null}
          <ChevronDown
            size={14}
            className={`o2-control__chevron ${open ? 'is-open' : ''}`}
            aria-hidden
          />
        </div>
        {popover}
      </div>
    </O2Field>
  );
}
