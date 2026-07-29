import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock, X } from 'lucide-react';
import { O2Field } from './Field';
import { useDismissOnFocusOutside } from './hooks/useDismissOnFocusOutside';
import type { O2FieldProps } from './types';

export type O2TimePickerProps = O2FieldProps & {
  value: string;
  onChange: (value: string) => void;
  /** HH:mm 或 HH:mm:ss */
  format?: 'HH:mm' | 'HH:mm:ss';
  placeholder?: string;
  allowClear?: boolean;
  ariaLabel?: string;
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function parseTime(value: string, withSeconds: boolean) {
  const parts = value.split(':').map((p) => Number(p));
  return {
    h: Number.isFinite(parts[0]) ? parts[0] : 0,
    m: Number.isFinite(parts[1]) ? parts[1] : 0,
    s: withSeconds && Number.isFinite(parts[2]) ? parts[2] : 0,
  };
}

function formatTime(h: number, m: number, s: number, withSeconds: boolean) {
  return withSeconds ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}`;
}

function Column({
  values,
  selected,
  onSelect,
  label,
}: {
  values: number[];
  selected: number;
  onSelect: (n: number) => void;
  label: string;
}) {
  return (
    <div className="o2-time__col" role="listbox" aria-label={label}>
      {values.map((n) => (
        <button
          key={n}
          type="button"
          role="option"
          aria-selected={n === selected}
          className={`o2-time__item ${n === selected ? 'is-selected' : ''}`}
          onClick={() => onSelect(n)}
        >
          {pad(n)}
        </button>
      ))}
    </div>
  );
}

export function O2TimePicker({
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
  format = 'HH:mm',
  placeholder,
  allowClear = true,
  ariaLabel,
}: O2TimePickerProps) {
  const withSeconds = format === 'HH:mm:ss';
  const autoId = useId();
  const fieldId = id || autoId;
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 200 });
  const anchorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const draft = useMemo(() => parseTime(value || '00:00:00', withSeconds), [value, withSeconds]);

  const dismiss = useCallback(() => setOpen(false), []);

  const updatePos = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.max(withSeconds ? 220 : 180, rect.width);
    let left = rect.left;
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - 8 - width);
    }
    let top = rect.bottom + 6;
    if (top + 280 > window.innerHeight - 8 && rect.top > 280) {
      top = Math.max(8, rect.top - 280 - 6);
    }
    setPos({ top, left, width });
  }, [withSeconds]);

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

  const commit = (h: number, m: number, s: number) => {
    onChange(formatTime(h, m, s, withSeconds));
  };

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  const seconds = minutes;

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
            className="o2-popover o2-popover--portal o2-popover--time"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <div className="o2-time">
              <Column
                label="时"
                values={hours}
                selected={draft.h}
                onSelect={(h) => commit(h, draft.m, draft.s)}
              />
              <Column
                label="分"
                values={minutes}
                selected={draft.m}
                onSelect={(m) => commit(draft.h, m, draft.s)}
              />
              {withSeconds ? (
                <Column
                  label="秒"
                  values={seconds}
                  selected={draft.s}
                  onSelect={(s) => commit(draft.h, draft.m, s)}
                />
              ) : null}
            </div>
            <div className="o2-cal__footer">
              <button
                type="button"
                className="o2-cal__chip"
                onClick={() => {
                  const now = new Date();
                  commit(now.getHours(), now.getMinutes(), now.getSeconds());
                  dismiss();
                }}
              >
                此刻
              </button>
              <button type="button" className="o2-cal__chip o2-cal__chip--primary" onClick={dismiss}>
                确定
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
          <Clock size={14} className="o2-control__leading" aria-hidden />
          <input
            id={fieldId}
            type="text"
            className="o2-control__input o2-control--tabular"
            value={value}
            placeholder={placeholder || format}
            readOnly
            disabled={disabled}
            aria-expanded={open}
            aria-invalid={error ? true : undefined}
            aria-label={ariaLabel || (typeof label === 'string' ? label : '时间')}
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
