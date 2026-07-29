import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, X } from 'lucide-react';
import { O2Field } from './Field';
import { O2SingleCalendarPanel } from './calendar/CalendarPanel';
import { useDismissOnFocusOutside } from './hooks/useDismissOnFocusOutside';
import type { O2FieldProps } from './types';

export type O2DatePickerProps = O2FieldProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  ariaLabel?: string;
};

export function O2DatePicker({
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
  onChange,
  placeholder = 'YYYY-MM-DD',
  allowClear = true,
  ariaLabel,
}: O2DatePickerProps) {
  const autoId = useId();
  const fieldId = id || autoId;
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 280 });
  const anchorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(() => setOpen(false), []);

  const updatePos = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.max(280, rect.width);
    let left = rect.left;
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - 8 - width);
    }
    let top = rect.bottom + 6;
    if (top + 340 > window.innerHeight - 8 && rect.top > 340) {
      top = Math.max(8, rect.top - 340 - 6);
    }
    setPos({ top, left, width });
  }, []);

  useDismissOnFocusOutside(open, [anchorRef, popoverRef], dismiss);

  useEffect(() => {
    if (!open) return;
    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open, updatePos]);

  const openPicker = () => {
    if (disabled) return;
    setOpen(true);
    window.requestAnimationFrame(updatePos);
  };

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
            className="o2-popover o2-popover--portal o2-popover--calendar"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <O2SingleCalendarPanel
              value={value}
              onChange={onChange}
              onComplete={dismiss}
            />
            <div className="o2-cal__footer">
              <button
                type="button"
                className="o2-cal__chip"
                onClick={() => {
                  const d = new Date();
                  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  onChange(iso);
                  dismiss();
                }}
              >
                今天
              </button>
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
          <Calendar size={14} className="o2-control__leading" aria-hidden />
          <input
            id={fieldId}
            type="text"
            className="o2-control__input o2-control--tabular"
            value={value}
            placeholder={placeholder}
            readOnly
            disabled={disabled}
            aria-expanded={open}
            aria-invalid={error ? true : undefined}
            aria-label={ariaLabel || (typeof label === 'string' ? label : '日期')}
            onFocus={openPicker}
            onKeyDown={(e) => {
              if (e.key === 'Escape') dismiss();
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openPicker();
              }
            }}
          />
          {allowClear && value && !disabled ? (
            <button
              type="button"
              className="o2-control__icon-btn"
              aria-label="清空"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                dismiss();
              }}
            >
              <X size={14} aria-hidden />
            </button>
          ) : null}
        </div>
        {popover}
      </div>
    </O2Field>
  );
}
